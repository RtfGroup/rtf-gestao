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
  resultadoComprasMes,
  resultadoEstoqueBaixo,
  resultadoItensVenda,
resultadoVendasClientes,
resultadoClientesAReceber,
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
      supabase
  .from('compras')
  .select('valor_total')
  .eq('empresa_id', empresaId)
  .gte(
    'data_compra',
    inicioMes.toISOString().split('T')[0],
  )
  .lt(
    'data_compra',
    inicioProximoMes.toISOString().split('T')[0],
  ),

supabase
  .from('estoque')
  .select(`
    quantidade_atual,
    estoque_minimo,
    produtos (
      nome
    )
  `)
  .eq('empresa_id', empresaId),

supabase
  .from('itens_venda')
  .select(`
  produto_id,
  quantidade,
  valor_unitario,
  produtos (
    nome,
    preco_custo,
    preco_venda
  ),
  vendas!inner (
      empresa_id,
      data_venda,
      status
    )
  `)
  .eq('vendas.empresa_id', empresaId)
  .gte('vendas.data_venda', inicioMes.toISOString())
  .lt(
    'vendas.data_venda',
    inicioProximoMes.toISOString(),
  )
  .neq('vendas.status', 'cancelada'),
  

supabase
  .from('vendas')
  .select(`
    cliente_id,
    valor_total,
    clientes (
      nome
    )
  `)
  .eq('empresa_id', empresaId)
  .gte('data_venda', inicioMes.toISOString())
  .lt('data_venda', inicioProximoMes.toISOString())
  .neq('status', 'cancelada'),

supabase
  .from('contas_receber')
  .select(`
    cliente_id,
    valor_original,
    valor_recebido,
    clientes (
      nome
    )
  `)
  .eq('empresa_id', empresaId)
  .neq('status', 'RECEBIDO'),
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

    const comprasMes =
  (resultadoComprasMes.data ?? []).reduce(
    (total, compra) =>
      total + Number(compra.valor_total ?? 0),
    0,
  )

const itensEstoqueBaixo =
  (resultadoEstoqueBaixo.data ?? []).filter(
    (item) =>
      Number(item.quantidade_atual ?? 0) <=
      Number(item.estoque_minimo ?? 0),
  )

const produtosEstoqueBaixo =
  itensEstoqueBaixo.length

const nomesProdutosEstoqueBaixo =
  itensEstoqueBaixo
    .map((item) => {
      const produto = Array.isArray(item.produtos)
        ? item.produtos[0]
        : item.produtos

      return produto?.nome ?? null
    })
    .filter(Boolean)

const rankingProdutos = new Map<
  string,
  {
    nome: string
    quantidade: number
    faturamento: number
    custoEstimado: number
    lucroEstimado: number
    margemPercentual: number
  }
>()

for (const item of resultadoItensVenda.data ?? []) {
  const produto = Array.isArray(item.produtos)
    ? item.produtos[0]
    : item.produtos

  if (!produto?.nome) {
    continue
  }

  const atual = rankingProdutos.get(item.produto_id)

const quantidade = Number(item.quantidade ?? 0)
const valorUnitario = Number(item.valor_unitario ?? 0)
const precoCusto = Number(produto.preco_custo ?? 0)

const faturamentoItem =
  quantidade * valorUnitario

const custoItem =
  quantidade * precoCusto

const faturamentoTotal =
  (atual?.faturamento ?? 0) +
  faturamentoItem

const custoTotal =
  (atual?.custoEstimado ?? 0) +
  custoItem

const lucroEstimado =
  faturamentoTotal - custoTotal

const margemPercentual =
  faturamentoTotal > 0
    ? (lucroEstimado / faturamentoTotal) * 100
    : 0

rankingProdutos.set(item.produto_id, {
  nome: produto.nome,
  quantidade:
    (atual?.quantidade ?? 0) +
    quantidade,
  faturamento: faturamentoTotal,
  custoEstimado: custoTotal,
  lucroEstimado,
  margemPercentual,
})
}

const produtoMaisVendido =
  [...rankingProdutos.values()].sort(
    (a, b) => b.quantidade - a.quantidade,
  )[0]

const produtoMaiorFaturamento =
  [...rankingProdutos.values()]
    .filter(
      (produto) =>
        produto.faturamento > 0,
    )
    .sort(
      (a, b) =>
        b.faturamento - a.faturamento,
    )[0]

  const produtoMenorMargem =
  [...rankingProdutos.values()]
    .filter(
      (produto) =>
        produto.faturamento > 0 &&
        produto.custoEstimado > 0 &&
        produto.margemPercentual > -100,
    )
    .sort(
      (a, b) =>
        a.margemPercentual -
        b.margemPercentual,
    )[0]

const produtoMaiorLucro =
  [...rankingProdutos.values()]
    .filter(
      (produto) =>
        produto.faturamento > 0,
    )
    .sort(
      (a, b) =>
        b.lucroEstimado -
        a.lucroEstimado,
    )[0]

    const produtoMaiorPrejuizo =
  [...rankingProdutos.values()]
    .filter(
      (produto) =>
        produto.lucroEstimado < 0,
    )
    .sort(
      (a, b) =>
        a.lucroEstimado -
        b.lucroEstimado,
    )[0]

const rankingClientes = new Map<
  string,
  {
    nome: string
    totalComprado: number
  }
>()

for (const venda of resultadoVendasClientes.data ?? []) {
  const cliente = Array.isArray(venda.clientes)
    ? venda.clientes[0]
    : venda.clientes

  if (!cliente?.nome || !venda.cliente_id) {
    continue
  }

  const atual = rankingClientes.get(venda.cliente_id)

  rankingClientes.set(venda.cliente_id, {
    nome: cliente.nome,
    totalComprado:
      (atual?.totalComprado ?? 0) +
      Number(venda.valor_total ?? 0),
  })
}

const melhorCliente =
  [...rankingClientes.values()].sort(
    (a, b) => b.totalComprado - a.totalComprado,
  )[0]

const clientesEmAberto =
  (resultadoClientesAReceber.data ?? [])
    .map((conta) => {
      const cliente = Array.isArray(conta.clientes)
        ? conta.clientes[0]
        : conta.clientes

      const saldo =
        Number(conta.valor_original ?? 0) -
        Number(conta.valor_recebido ?? 0)

      return {
        nome: cliente?.nome ?? 'Cliente',
        saldo: Math.max(saldo, 0),
      }
    })
    .filter((item) => item.saldo > 0)

    const clienteMaiorDebito =
  [...clientesEmAberto].sort(
    (a, b) => b.saldo - a.saldo,
  )[0]

  return {
  vendasHoje,
  vendasMes,
  melhorCliente:
  melhorCliente?.nome ?? undefined,

valorMelhorCliente:
  melhorCliente?.totalComprado ?? undefined,

clientesEmAberto,
  receber,
  pagar,
  saldoCaixa,
  comprasMes,
  produtosEstoqueBaixo,
nomesProdutosEstoqueBaixo,
produtoMaisVendido:
    produtoMaisVendido?.nome ?? undefined,
  produtoMaiorFaturamento:
  produtoMaiorFaturamento?.nome ?? undefined,
faturamentoProdutoMaiorFaturamento:
  produtoMaiorFaturamento?.faturamento ?? undefined,
    quantidadeProdutoMaisVendido:
    produtoMaisVendido?.quantidade ?? undefined,
produtoMenorMargem:
  produtoMenorMargem?.nome ?? undefined,

margemProdutoMenorMargem:
  produtoMenorMargem?.margemPercentual ?? undefined,

lucroProdutoMenorMargem:
  produtoMenorMargem?.lucroEstimado ?? undefined,

produtoMaiorLucro:
  produtoMaiorLucro?.nome ?? undefined,

lucroProdutoMaiorLucro:
  produtoMaiorLucro?.lucroEstimado ?? undefined,

margemProdutoMaiorLucro:
  produtoMaiorLucro?.margemPercentual ?? undefined,

  produtoMaiorPrejuizo:
  produtoMaiorPrejuizo?.nome ?? undefined,

valorMaiorPrejuizo:
  produtoMaiorPrejuizo
    ? Math.abs(produtoMaiorPrejuizo.lucroEstimado)
    : undefined,

clienteMaiorDebito:
  clienteMaiorDebito?.nome ?? undefined,

valorClienteMaiorDebito:
  clienteMaiorDebito?.saldo ?? undefined,

  }
}