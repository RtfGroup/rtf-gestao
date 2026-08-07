import { supabase } from '../../lib/supabase'

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\bcliente\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

export async function localizarContaReceber(
  empresaId: string,
  cliente: string,
) {
  const { data: contas, error: erroContas } =
    await supabase
      .from('contas_receber')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('status', 'PENDENTE')

  if (erroContas) {
    throw erroContas
  }

  const idsClientes = [
    ...new Set(
      (contas ?? [])
        .map((conta) => conta.cliente_id)
        .filter(Boolean),
    ),
  ]

  if (idsClientes.length === 0) {
    return null
  }

  const { data: clientes, error: erroClientes } =
    await supabase
      .from('clientes')
      .select('id,nome')
      .in('id', idsClientes)

  if (erroClientes) {
    throw erroClientes
  }

  const clienteProcurado = normalizar(cliente)

  const clienteEncontrado =
    (clientes ?? []).find((item) => {
      const nome = normalizar(item.nome ?? '')

      return (
        nome === clienteProcurado ||
        nome.includes(clienteProcurado) ||
        clienteProcurado.includes(nome)
      )
    })

  if (!clienteEncontrado) {
    return null
  }

  const contaEncontrada =
    (contas ?? [])
      .filter(
        (conta) =>
          conta.cliente_id === clienteEncontrado.id,
      )
      .sort(
        (a, b) =>
          new Date(a.data_vencimento).getTime() -
          new Date(b.data_vencimento).getTime(),
      )[0] ?? null

  if (!contaEncontrada) {
    return null
  }

  const saldoPendente = Math.max(
    Number(contaEncontrada.valor_original ?? 0) -
      Number(contaEncontrada.valor_recebido ?? 0),
    0,
  )

  return {
    ...contaEncontrada,
    saldo_pendente: saldoPendente,
  }
}

export async function registrarBaixaRecebimento({
  contaId,
  valor,
  formaPagamento,
}: {
  contaId: string
  valor: number
  formaPagamento: string
}) {
  const { data, error } = await supabase.rpc(
    'receber_conta',
    {
      p_conta_receber_id: contaId,
      p_valor_recebido: valor,
      p_data_recebimento: new Date().toISOString(),
      p_observacoes:
        `Recebimento registrado pela RTF AI - ${formaPagamento}`,
    },
  )

  if (error) {
    throw error
  }

  return data
}