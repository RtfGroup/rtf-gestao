export type TipoComandoIA =
  | 'VENDA'
  | 'COMPRA'
  | 'ESTOQUE'
  | 'CAIXA'
  | 'RECEBIMENTO'
  | 'PAGAMENTO'
  | 'ANALISE'
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
  comando.includes('dar baixa no recebimento')
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
  comando.includes('como esta minha situacao financeira') ||
comando.includes('situacao financeira') ||
comando.includes('como estao minhas financas') ||
  comando.includes('resumo financeiro') ||
  comando.includes('saude financeira') ||
  comando.includes('como esta a empresa') ||
  comando.includes('analise financeira') ||
  comando.includes('analisar empresa') ||
  comando.includes('o que recomenda') ||
  comando.includes('o que voce recomenda') ||
  comando.includes('recomendacao') ||
  comando.includes('melhorar a empresa')
) {
  return 'ANALISE'
}

return 'DESCONHECIDO'
}