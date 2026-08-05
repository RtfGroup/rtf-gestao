export type TipoComandoIA =
  | 'VENDA'
  | 'COMPRA'
  | 'ESTOQUE'
  | 'CAIXA'
  | 'RECEBIMENTO'
  | 'PAGAMENTO'
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
    comando.includes('saldo')
  ) {
    return 'CAIXA'
  }

  if (
    comando.includes('recebi') ||
    comando.includes('recebimento')
  ) {
    return 'RECEBIMENTO'
  }

  if (
    comando.includes('paguei') ||
    comando.includes('pagamento')
  ) {
    return 'PAGAMENTO'
  }

  return 'DESCONHECIDO'
}