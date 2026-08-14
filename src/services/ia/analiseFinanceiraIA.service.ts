export interface AnaliseFinanceiraIA {
  tipo:
    | 'RESUMO'
    | 'SAUDE'
    | 'RECOMENDACAO'
    | 'MAIOR_PROBLEMA'
    | 'PRIORIZAR_CONTAS'
}
export interface DadosAnaliseFinanceira
 {
  vendasHoje: number
  vendasMes: number
  receber: number
  pagar: number
  saldoCaixa: number
  produtoMaisVendido?: string
  quantidadeProdutoMaisVendido?: number
  produtoMaiorFaturamento?: string
faturamentoProdutoMaiorFaturamento?: number
  produtosEstoqueBaixo?: number
  nomesProdutosEstoqueBaixo?: string[]
  comprasMes?: number
  produtoMenorMargem?: string
margemProdutoMenorMargem?: number
lucroProdutoMenorMargem?: number
produtoMaiorLucro?: string
lucroProdutoMaiorLucro?: number
margemProdutoMaiorLucro?: number
produtoMaiorPrejuizo?: string
valorMaiorPrejuizo?: number
melhorCliente?: string
valorMelhorCliente?: number
clienteMaiorDebito?: string
valorClienteMaiorDebito?: number
clientesEmAberto?: {
  nome: string
  saldo: number
}[]
}

export function interpretarAnaliseFinanceiraIA(
  texto: string,
): AnaliseFinanceiraIA {
  const comando = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

    if (
  comando.includes('quais contas devo priorizar') ||
  comando.includes('qual conta devo priorizar') ||
  comando.includes('qual conta pagar primeiro') ||
  comando.includes('qual conta devo pagar primeiro') ||
  comando.includes('priorizar contas')
) {
  return {
    tipo: 'PRIORIZAR_CONTAS',
  }
}

    if (
  comando.includes('qual meu maior problema') ||
  comando.includes('maior problema') ||
  comando.includes('maiores problemas') ||
  comando.includes('o que esta prejudicando meu caixa') ||
  comando.includes('o que esta prejudicando a empresa') ||
  comando.includes('onde estou perdendo dinheiro')
) {
  return {
    tipo: 'MAIOR_PROBLEMA',
  }
}

  if (
    comando.includes('recomenda') ||
    comando.includes('melhorar') ||
    comando.includes('o que devo fazer') ||
    comando.includes('o que fazer agora') ||
    comando.includes('maior problema') ||
    comando.includes('maiores problemas') ||
    comando.includes('prejudicando') ||
    comando.includes('priorizar') ||
    comando.includes('pagar primeiro') ||
    comando.includes('perdendo dinheiro') ||
    comando.includes('melhorar meu caixa')
  ) {
    return {
      tipo: 'RECOMENDACAO',
    }
  }

  if (
    comando.includes('saude financeira') ||
    comando.includes('como esta a empresa') ||
    comando.includes('como esta meu negocio') ||
    comando.includes('como esta o negocio') ||
    comando.includes('situacao financeira') ||
    comando.includes('como estao minhas financas')
  ) {
    return {
      tipo: 'SAUDE',
    }
  }

  return {
    tipo: 'RESUMO',
  }
}

export function gerarRespostaAnaliseFinanceira(
  analise: AnaliseFinanceiraIA,
  dados: DadosAnaliseFinanceira,
  formatarMoeda: (valor: number) => string,
) {
  const resultadoMes =
    dados.vendasMes - dados.pagar

  if (analise.tipo === 'RESUMO') {
    return [
      '📊 Resumo financeiro da empresa.',
      '',
      `Vendas hoje: ${formatarMoeda(dados.vendasHoje)}`,
      `Vendas no mês: ${formatarMoeda(dados.vendasMes)}`,
      `Contas a receber: ${formatarMoeda(dados.receber)}`,
      `Contas a pagar: ${formatarMoeda(dados.pagar)}`,
      `Saldo do caixa: ${formatarMoeda(dados.saldoCaixa)}`,
      '',
      `Resultado estimado do mês: ${formatarMoeda(resultadoMes)}`,
    ].join('\n')
  }

  if (analise.tipo === 'SAUDE') {
    const caixaPositivo = dados.saldoCaixa >= 0
    const compromissosCobertos =
      dados.saldoCaixa + dados.receber >= dados.pagar

    return [
      caixaPositivo
        ? '✅ O caixa está positivo.'
        : '⚠️ O caixa está negativo.',
      compromissosCobertos
        ? '✅ O caixa e os recebimentos cobrem as contas a pagar.'
        : '⚠️ O caixa e os recebimentos não cobrem todas as contas a pagar.',
      '',
      `Saldo do caixa: ${formatarMoeda(dados.saldoCaixa)}`,
      `A receber: ${formatarMoeda(dados.receber)}`,
      `A pagar: ${formatarMoeda(dados.pagar)}`,
      `Vendas do mês: ${formatarMoeda(dados.vendasMes)}`,
    ].join('\n')
  }

if (analise.tipo === 'MAIOR_PROBLEMA') {
  const recursosDisponiveis =
    dados.saldoCaixa + dados.receber

  const faltaParaCobrirContas =
    dados.pagar - recursosDisponiveis

  const comprasAcimaVendas =
    (dados.comprasMes ?? 0) - dados.vendasMes

  if (
    dados.pagar > 0 &&
    faltaParaCobrirContas > 0
  ) {
    const cobertura =
      (recursosDisponiveis / dados.pagar) * 100

    return [
      '🚨 Principal problema financeiro identificado:',
      '',
      'Falta de cobertura para as contas a pagar.',
      '',
      `Você possui ${formatarMoeda(dados.saldoCaixa)} em caixa e ${formatarMoeda(dados.receber)} a receber.`,
      `Isso representa ${formatarMoeda(recursosDisponiveis)} disponíveis contra ${formatarMoeda(dados.pagar)} em contas a pagar.`,
      '',
      `Hoje seus recursos cobrem apenas ${cobertura.toFixed(1)}% dos compromissos.`,
      `Existe uma diferença de ${formatarMoeda(faltaParaCobrirContas)}.`,
      '',
      '🎯 Prioridade: preservar o caixa, acelerar cobranças e priorizar as contas com vencimento mais próximo.',
    ].join('\n')
  }

  if (comprasAcimaVendas > 0) {
    return [
      '⚠️ Principal problema financeiro identificado:',
      '',
      'As compras estão maiores que as vendas.',
      '',
      `Compras do mês: ${formatarMoeda(dados.comprasMes ?? 0)}`,
      `Vendas do mês: ${formatarMoeda(dados.vendasMes)}`,
      `Diferença: ${formatarMoeda(comprasAcimaVendas)}`,
      '',
      '🎯 Prioridade: reduzir compras não essenciais e aumentar o giro dos produtos já adquiridos.',
    ].join('\n')
  }

  if (dados.saldoCaixa < 0) {
    return [
      '🚨 Principal problema financeiro identificado:',
      '',
      `O caixa está negativo em ${formatarMoeda(Math.abs(dados.saldoCaixa))}.`,
      '',
      '🎯 Prioridade: interromper despesas não essenciais e reforçar as entradas de caixa.',
    ].join('\n')
  }

  return [
    '✅ Não identifiquei um problema financeiro crítico neste momento.',
    '',
    'Continue acompanhando caixa, contas a pagar, recebimentos, vendas e compras.',
  ].join('\n')
}

  const recomendacoes: string[] = []

  const recursosDisponiveis =
  dados.saldoCaixa + dados.receber

const coberturaContas =
  dados.pagar > 0
    ? (recursosDisponiveis / dados.pagar) * 100
    : 100

const comprometimentoVendas =
  dados.vendasMes > 0
    ? (dados.pagar / dados.vendasMes) * 100
    : 0

if (coberturaContas < 50) {
  recomendacoes.push(
    `🚨 Atenção: os recursos disponíveis cobrem apenas ${coberturaContas.toFixed(1)}% das contas a pagar.`,
  )
} else if (coberturaContas < 100) {
  recomendacoes.push(
    `⚠️ Caixa e recebimentos cobrem ${coberturaContas.toFixed(1)}% das contas a pagar.`,
  )
}

if (comprometimentoVendas > 100) {
  recomendacoes.push(
    `📉 As contas a pagar representam ${comprometimentoVendas.toFixed(1)}% das vendas do mês.`,
  )
}

  if (dados.pagar > dados.saldoCaixa + dados.receber) {
    recomendacoes.push(
      'Reduza despesas e priorize as contas mais próximas do vencimento.',
    )
  }

  if (dados.receber > 0) {
    recomendacoes.push(
      'Faça a cobrança das contas a receber para reforçar o caixa.',
    )
  }

  if (dados.saldoCaixa < 0) {
    recomendacoes.push(
      'Evite novas despesas até o caixa voltar a ficar positivo.',
    )
  }

  if (dados.vendasMes <= 0) {
    recomendacoes.push(
      'Revise vendas, preços e canais de atendimento.',
    )
  }

if (dados.produtoMaisVendido) {
  recomendacoes.push(
    `🏆 O produto mais vendido é ${dados.produtoMaisVendido}${
      dados.quantidadeProdutoMaisVendido
        ? `, com ${dados.quantidadeProdutoMaisVendido} unidades vendidas`
        : ''
    }.`,
  )
}

if (
  dados.produtoMaiorFaturamento &&
  dados.faturamentoProdutoMaiorFaturamento !== undefined
) {
  recomendacoes.push(
    `📈 O produto que mais fatura é ${dados.produtoMaiorFaturamento}, com faturamento de ${formatarMoeda(dados.faturamentoProdutoMaiorFaturamento)}.`,
  )
}

if (
  dados.produtosEstoqueBaixo !== undefined &&
  dados.produtosEstoqueBaixo > 0
) {
  const nomes =
    dados.nomesProdutosEstoqueBaixo?.length
      ? `: ${dados.nomesProdutosEstoqueBaixo.join(', ')}`
      : ''

  recomendacoes.push(
    `📦 Existem ${dados.produtosEstoqueBaixo} produtos com estoque baixo${nomes}. Priorize a reposição.`,
  )
}

if (
  dados.comprasMes !== undefined &&
  dados.comprasMes > dados.vendasMes
) {
  if (
  dados.produtoMenorMargem &&
  dados.margemProdutoMenorMargem !== undefined
) {
  recomendacoes.push(
    `📉 O produto com menor margem é ${dados.produtoMenorMargem}, com margem estimada de ${dados.margemProdutoMenorMargem.toFixed(1)}%.`,
  )
}

if (
  dados.produtoMaiorLucro &&
  dados.lucroProdutoMaiorLucro !== undefined
) {
  recomendacoes.push(
    `💰 O produto que mais gera lucro é ${dados.produtoMaiorLucro}, com lucro estimado de ${formatarMoeda(dados.lucroProdutoMaiorLucro)} e margem de ${(dados.margemProdutoMaiorLucro ?? 0).toFixed(1)}%.`,
  )
}

if (
  dados.produtoMenorMargem &&
  dados.lucroProdutoMenorMargem !== undefined &&
  dados.lucroProdutoMenorMargem < 0
) {
  recomendacoes.push(
    `🚨 ${dados.produtoMenorMargem} está apresentando prejuízo estimado. Revise preço de venda e custo do produto.`,
  )
}
  recomendacoes.push(
    `⚠️ As compras do mês (${formatarMoeda(
      dados.comprasMes,
    )}) estão maiores que as vendas (${formatarMoeda(
      dados.vendasMes,
    )}).`,
  )
}

if (
  dados.melhorCliente &&
  dados.valorMelhorCliente !== undefined
) {
  recomendacoes.push(
    `👤 O cliente que mais comprou no mês foi ${dados.melhorCliente}, com ${formatarMoeda(dados.valorMelhorCliente)} em compras.`,
  )
}

if (
  dados.clientesEmAberto &&
  dados.clientesEmAberto.length > 0
) {
  const totalAberto =
    dados.clientesEmAberto.reduce(
      (total, cliente) =>
        total + cliente.saldo,
      0,
    )

  recomendacoes.push(
    `💳 Existem ${dados.clientesEmAberto.length} clientes com valores em aberto, totalizando ${formatarMoeda(totalAberto)}.`,
  )
}

const clienteMaiorDevedor =
  dados.clientesEmAberto
    ?.sort((a, b) => b.saldo - a.saldo)[0]

if (clienteMaiorDevedor) {
  recomendacoes.push(
    `⚠️ O cliente com maior valor em aberto é ${clienteMaiorDevedor.nome}, devendo ${formatarMoeda(clienteMaiorDevedor.saldo)}.`,
  )
}

  if (recomendacoes.length === 0) {
    recomendacoes.push(
      'Continue acompanhando diariamente vendas, caixa e despesas.',
    )
  }

  if (
  dados.produtoMaiorPrejuizo &&
  dados.valorMaiorPrejuizo !== undefined
) {
  recomendacoes.push(
    `🚨 O produto com maior prejuízo é ${dados.produtoMaiorPrejuizo}, com prejuízo estimado de ${formatarMoeda(dados.valorMaiorPrejuizo)}.`,
  )
}

  const recomendacoesPrioritarias =
  recomendacoes.slice(0, 5)

return [
  '🧠 RTF AI — Diagnóstico financeiro',
  '',
  recomendacoesPrioritarias.length > 0
    ? 'Estes são os pontos que exigem mais atenção agora:'
    : 'Não identifiquei problemas financeiros relevantes.',
  '',
  ...recomendacoesPrioritarias.map(
    (item, indice) => `${indice + 1}. ${item}`,
  ),
  '',
  recomendacoes.length > 5
    ? `Analisei outros ${recomendacoes.length - 5} indicadores do negócio, mas priorizei os 5 mais importantes.`
    : '',
].filter(Boolean).join('\n')
}