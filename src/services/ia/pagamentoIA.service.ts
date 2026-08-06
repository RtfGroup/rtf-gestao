export interface PagamentoIA {
  fornecedor: string
  valor: number
  formaPagamento: string
  referencia: string
}

export function interpretarPagamentoIA(
  texto: string,
): PagamentoIA {
  const minusculo = texto.toLowerCase()

  const valor =
    Number(
      (
        minusculo.match(/(\d+[.,]?\d*)/)?.[1] ?? '0'
      ).replace(',', '.'),
    ) || 0

  const formaPagamento =
    minusculo.includes('pix')
      ? 'PIX'
      : minusculo.includes('dinheiro')
      ? 'DINHEIRO'
      : minusculo.includes('cartão')
      ? 'CARTAO'
      : 'PIX'

  const fornecedor = texto
    .replace(/paguei/gi, '')
    .replace(/r\$/gi, '')
    .replace(/[0-9.,]/g, '')
    .replace(/para\s+/gi, '')
    .replace(/\bem\b/gi, '')
    .replace(/pix/gi, '')
    .replace(/dinheiro/gi, '')
    .replace(/cartão/gi, '')
    .replace(/referente.*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const referencia =
    texto.match(/referente (.+)/i)?.[1] ?? ''

  return {
    fornecedor,
    valor,
    formaPagamento,
    referencia,
  }
}