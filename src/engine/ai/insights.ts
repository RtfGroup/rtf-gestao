import { supabase } from '../../lib/supabase'

export interface Insight {
  titulo: string
  descricao: string
  tipo: 'INFO' | 'SUCESSO' | 'ALERTA'
}

interface ProdutoRelacionado {
  nome: string
  estoque_minimo: number | null
}

interface ItemEstoqueInsight {
  quantidade_atual: number | null
  produtos:
    | ProdutoRelacionado
    | ProdutoRelacionado[]
    | null
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export async function gerarInsights(
  empresaId: string,
): Promise<Insight[]> {
  const insights: Insight[] = []

  const { data: notificacoes } = await supabase
    .from('notificacoes')
    .select('titulo')
    .eq('empresa_id', empresaId)
    .eq('lida', false)

  if ((notificacoes?.length ?? 0) > 0) {
    insights.push({
      titulo: 'Existem notificações pendentes',
      descricao: `Você possui ${notificacoes?.length} notificação(ões) aguardando atenção.`,
      tipo: 'ALERTA',
    })
  }

  const { data: estoqueBaixo } = await supabase
    .from('estoque')
    .select(`
      quantidade_atual,
      produtos (
        nome,
        estoque_minimo
      )
    `)
    .eq('empresa_id', empresaId)

  const produtosCriticos = (
    (estoqueBaixo ?? []) as ItemEstoqueInsight[]
  ).filter((item) => {
    const produto = Array.isArray(item.produtos)
      ? item.produtos[0]
      : item.produtos

    return (
      Number(item.quantidade_atual ?? 0) <=
      Number(produto?.estoque_minimo ?? 0)
    )
  })

  if (produtosCriticos.length > 0) {
    insights.push({
      titulo: 'Estoque crítico',
      descricao: `${produtosCriticos.length} produto(s) precisam de reposição.`,
      tipo: 'ALERTA',
    })
  }

  const inicioHoje = new Date()
  inicioHoje.setHours(0, 0, 0, 0)

  const inicioAmanha = new Date(inicioHoje)
  inicioAmanha.setDate(inicioAmanha.getDate() + 1)

  const { data: vendasHoje } = await supabase
    .from('vendas')
    .select('valor_total')
    .eq('empresa_id', empresaId)
    .gte('data_venda', inicioHoje.toISOString())
    .lt('data_venda', inicioAmanha.toISOString())
    .neq('status', 'cancelada')

  const quantidadeVendasHoje = vendasHoje?.length ?? 0

  const faturamentoHoje = (vendasHoje ?? []).reduce(
    (total, venda) =>
      total + Number(venda.valor_total ?? 0),
    0,
  )

  if (quantidadeVendasHoje === 0) {
    insights.push({
      titulo: 'Nenhuma venda hoje',
      descricao:
        'Até o momento nenhuma venda foi registrada hoje.',
      tipo: 'INFO',
    })
  } else {
    const ticketMedio =
      faturamentoHoje / quantidadeVendasHoje

    insights.push({
      titulo: 'Resumo das vendas de hoje',
      descricao: `${quantidadeVendasHoje} venda(s), faturamento de ${formatarMoeda(
        faturamentoHoje,
      )} e ticket médio de ${formatarMoeda(ticketMedio)}.`,
      tipo: 'SUCESSO',
    })
  }

  const hoje = new Date().toISOString().substring(0, 10)

  const { data: contasVencidas } = await supabase
    .from('contas_pagar')
    .select('valor_original, valor_pago')
    .eq('empresa_id', empresaId)
    .lt('data_vencimento', hoje)
    .neq('status', 'PAGO')

  const totalVencido = (contasVencidas ?? []).reduce(
    (total, conta) => {
      const saldo =
        Number(conta.valor_original ?? 0) -
        Number(conta.valor_pago ?? 0)

      return total + Math.max(saldo, 0)
    },
    0,
  )

  if ((contasVencidas?.length ?? 0) > 0) {
    insights.push({
      titulo: 'Contas vencidas',
      descricao: `Existem ${
        contasVencidas?.length ?? 0
      } conta(s) vencida(s), totalizando ${formatarMoeda(
        totalVencido,
      )}.`,
      tipo: 'ALERTA',
    })
  }

const { data: itensVendidos } = await supabase
  .from('vendas_itens')
  .select(`
    quantidade,
    produtos (
      nome
    ),
    vendas!inner (
      empresa_id,
      data_venda,
      status
    )
  `)
  .eq('vendas.empresa_id', empresaId)
  .gte('vendas.data_venda', inicioHoje.toISOString())
  .lt('vendas.data_venda', inicioAmanha.toISOString())
  .neq('vendas.status', 'cancelada')

const ranking = new Map<
  string,
  { nome: string; quantidade: number }
>()

;(itensVendidos ?? []).forEach((item: any) => {
  const produto = Array.isArray(item.produtos)
    ? item.produtos[0]
    : item.produtos

  if (!produto) return

  const atual = ranking.get(produto.nome)

  if (atual) {
    atual.quantidade += Number(item.quantidade)
  } else {
    ranking.set(produto.nome, {
      nome: produto.nome,
      quantidade: Number(item.quantidade),
    })
  }
})

const maisVendido = [...ranking.values()].sort(
  (a, b) => b.quantidade - a.quantidade,
)[0]

if (maisVendido) {
  insights.push({
    titulo: 'Produto destaque',
    descricao: `${maisVendido.nome} foi o produto mais vendido hoje (${maisVendido.quantidade} unidade(s)).`,
    tipo: 'SUCESSO',
  })
}

const { data: vendasClientes } = await supabase
  .from('vendas')
  .select(`
    valor_total,
    clientes (
      nome
    )
  `)
  .eq('empresa_id', empresaId)
  .gte('data_venda', inicioHoje.toISOString())
  .lt('data_venda', inicioAmanha.toISOString())
  .neq('status', 'cancelada')

const rankingClientes = new Map<
  string,
  { nome: string; valor: number }
>()

;(vendasClientes ?? []).forEach((venda: any) => {
  const cliente = Array.isArray(venda.clientes)
    ? venda.clientes[0]
    : venda.clientes

  const nome = cliente?.nome ?? 'Consumidor Final'

  const atual = rankingClientes.get(nome)

  if (atual) {
    atual.valor += Number(venda.valor_total)
  } else {
    rankingClientes.set(nome, {
      nome,
      valor: Number(venda.valor_total),
    })
  }
})

const melhorCliente = [...rankingClientes.values()].sort(
  (a, b) => b.valor - a.valor,
)[0]

if (melhorCliente) {
  insights.push({
    titulo: 'Melhor cliente do dia',
    descricao: `${melhorCliente.nome} comprou ${formatarMoeda(
      melhorCliente.valor,
    )} hoje.`,
    tipo: 'SUCESSO',
  })
}

  return insights
}