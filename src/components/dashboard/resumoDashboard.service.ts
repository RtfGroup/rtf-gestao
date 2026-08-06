import { supabase } from '../../lib/supabase'

export async function obterResumoDashboard(
  empresaId: string,
) {
  const agora = new Date()

  const inicioHoje = new Date(agora)
  inicioHoje.setHours(0, 0, 0, 0)

  const inicioAmanha = new Date(inicioHoje)
  inicioAmanha.setDate(inicioAmanha.getDate() + 1)

  const inicioMes = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    1,
  )

  const inicioProximoMes = new Date(
    agora.getFullYear(),
    agora.getMonth() + 1,
    1,
  )

  const [
    resultadoVendasHoje,
    resultadoVendasMes,
    resultadoReceber,
    resultadoPagar,
    resultadoFluxo,
  ] = await Promise.all([
    supabase
      .from('vendas')
      .select('valor_total')
      .eq('empresa_id', empresaId)
      .gte('data_venda', inicioHoje.toISOString())
      .lt('data_venda', inicioAmanha.toISOString())
      .neq('status', 'cancelada'),

    supabase
      .from('vendas')
      .select('valor_total')
      .eq('empresa_id', empresaId)
      .gte('data_venda', inicioMes.toISOString())
      .lt('data_venda', inicioProximoMes.toISOString())
      .neq('status', 'cancelada'),

    supabase
      .from('contas_receber')
      .select('valor_original,valor_recebido')
      .eq('empresa_id', empresaId)
      .neq('status', 'RECEBIDO'),

    supabase
      .from('contas_pagar')
      .select('valor_original,valor_pago')
      .eq('empresa_id', empresaId)
      .neq('status', 'PAGO'),

    supabase
      .from('fluxo_caixa')
      .select('valor,tipo')
      .eq('empresa_id', empresaId),
  ])

  const vendasHoje =
    (resultadoVendasHoje.data ?? []).reduce(
      (t, v) => t + Number(v.valor_total ?? 0),
      0,
    )

  const vendasMes =
    (resultadoVendasMes.data ?? []).reduce(
      (t, v) => t + Number(v.valor_total ?? 0),
      0,
    )

  const receber =
    (resultadoReceber.data ?? []).reduce(
      (t, c) =>
        t +
        Math.max(
          Number(c.valor_original ?? 0) -
            Number(c.valor_recebido ?? 0),
          0,
        ),
      0,
    )

  const pagar =
    (resultadoPagar.data ?? []).reduce(
      (t, c) =>
        t +
        Math.max(
          Number(c.valor_original ?? 0) -
            Number(c.valor_pago ?? 0),
          0,
        ),
      0,
    )

  const saldoCaixa =
    (resultadoFluxo.data ?? []).reduce(
      (t, m) => {
        const valor = Number(m.valor ?? 0)

        return m.tipo === 'entrada'
          ? t + valor
          : t - valor
      },
      0,
    )

  return {
    vendasHoje,
    vendasMes,
    receber,
    pagar,
    saldoCaixa,
  }
}