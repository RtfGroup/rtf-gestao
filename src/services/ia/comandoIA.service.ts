export type TipoComandoIA =
  | 'VENDA'
  | 'COMPRA'
  | 'ESTOQUE'
  | 'CAIXA'
  | 'RECEBIMENTO'
  | 'PAGAMENTO'
  | 'ANALISE'
| 'DEVEDORES'
| 'PRIORIZAR_COBRANCAS'
| 'RECEBER_E_DEVEDORES'
| 'PRIORIDADES_HOJE'
| 'MAIOR_PROBLEMA_E_PRIORIDADES'
| 'DESCONHECIDO'

export function identificarComandoIA(
  texto: string,
): TipoComandoIA {
  const comando = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  if (
    comando.includes('vendi') ||
    comando.includes('venda')
  ) {
    return 'VENDA'
  }

  if (
    comando.includes('comprei') ||
    comando.includes('compra')
  ) {
    return 'COMPRA'
  }

  if (
    comando.includes('estoque') ||
    comando.includes('quantos produtos')
  ) {
    return 'ESTOQUE'
  }

  if (
  (
    comando.includes('quanto tenho para receber') ||
    comando.includes('quanto tenho a receber') ||
    comando.includes('total a receber')
  ) &&
  (
    comando.includes('quem esta me devendo') ||
    comando.includes('quem me deve') ||
    comando.includes('devedores')
  )
) {
  return 'RECEBER_E_DEVEDORES'
}

  if (
  comando.includes('caixa') ||
  comando.includes('saldo') ||
  comando.includes('quanto tenho em caixa') ||
  comando.includes('fluxo de caixa') ||
  comando.includes('quanto tenho para receber') ||
  comando.includes('quanto tenho para pagar') ||
  comando.includes('quanto vendi hoje') ||
  comando.includes('quanto vendi esse mes') ||
  comando.includes('quanto vendi este mes') ||
  comando.includes('faturamento') ||
  comando.includes('vendas de hoje') ||
  comando.includes('vendas do mes') ||
  comando.includes('vendas deste mes')
) {
  return 'CAIXA'
}

  if (
  comando.includes('recebi') ||
  comando.includes('recebimento') ||
  comando.includes('cliente pagou') ||
  comando.includes('pagou a conta') ||
  comando.includes('pagou o fiado') ||
  comando.includes('baixar recebimento') ||
  comando.includes('dar baixa no recebimento') ||
  /\bpagou\b/.test(comando)
) {
  return 'RECEBIMENTO'
}

if (
  comando.includes('paguei') ||
  comando.includes('pagamento') ||
  comando.includes('pagar fornecedor') ||
  comando.includes('pagar conta') ||
  comando.includes('conta paga') ||
  comando.includes('baixar pagamento') ||
  comando.includes('dar baixa no pagamento')
) {
  return 'PAGAMENTO'
}

if (
  comando.includes('quem devo cobrar primeiro') ||
  comando.includes('quem cobrar primeiro') ||
  comando.includes('quem devo cobrar') ||
  comando.includes('priorizar cobrancas') ||
  comando.includes('priorizar cobranças') ||
  comando.includes('qual cliente cobrar primeiro')
) {
  return 'PRIORIZAR_COBRANCAS'
}

if (
  comando.includes('quem esta me devendo') ||
  comando.includes('quem me deve') ||
  comando.includes('clientes devendo') ||
  comando.includes('clientes em aberto') ||
  comando.includes('fiados em aberto') ||
  comando.includes('quem esta devendo') ||
  comando.includes('maiores devedores') ||
  comando.includes('maior devedor')
) {
  return 'DEVEDORES'
}

if (
  (
    comando.includes('qual meu maior problema') ||
    comando.includes('maior problema') ||
    comando.includes('maiores problemas')
  ) &&
  (
    comando.includes('o que devo fazer hoje') ||
    comando.includes('o que fazer hoje') ||
    comando.includes('prioridades de hoje')
  )
) {
  return 'MAIOR_PROBLEMA_E_PRIORIDADES'
}

if (
  comando.includes('o que devo fazer hoje') ||
  comando.includes('o que fazer hoje') ||
  comando.includes('prioridades de hoje') ||
  comando.includes('minhas prioridades hoje')
) {
  return 'PRIORIDADES_HOJE'
}

if (
  comando.includes('como esta minha situacao financeira') ||
  comando.includes('situacao financeira') ||
  comando.includes('como estao minhas financas') ||
  comando.includes('resumo financeiro') ||
  comando.includes('saude financeira') ||
  comando.includes('como esta a empresa') ||
  comando.includes('como esta meu negocio') ||
  comando.includes('como esta o negocio') ||
  comando.includes('analise financeira') ||
  comando.includes('analisar empresa') ||
  comando.includes('analise da empresa') ||
  comando.includes('o que recomenda') ||
  comando.includes('o que voce recomenda') ||
  comando.includes('o que devo fazer') ||
  comando.includes('o que fazer agora') ||
  comando.includes('recomendacao') ||
  comando.includes('melhorar a empresa') ||
  comando.includes('melhorar meu negocio') ||
  comando.includes('problemas da empresa') ||
  comando.includes('qual meu maior problema') ||
  comando.includes('quais meus maiores problemas') ||
  comando.includes('o que esta prejudicando meu caixa') ||
  comando.includes('o que esta prejudicando a empresa') ||
  comando.includes('como melhorar meu caixa') ||
  comando.includes('quais contas devo priorizar') ||
  comando.includes('qual conta devo pagar primeiro') ||
  comando.includes('onde estou perdendo dinheiro')
) {
  return 'ANALISE'
}

return 'DESCONHECIDO'
}