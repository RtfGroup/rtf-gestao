export interface RecebimentoIA {
  cliente: string
  valor: number
  formaPagamento: string
  referencia: string
}

export function interpretarRecebimentoIA(
  texto: string,
): RecebimentoIA {
  const minusculo = texto.toLowerCase()

  const valor =
    Number(
      (
        minusculo.match(
          /(\d+[.,]?\d*)/,
        )?.[1] ?? '0'
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

  const cliente =
  texto
    .replace(/recebi/gi, '')
    .replace(/r\$/gi, '')
    .replace(/[0-9.,]/g, '')
    .replace(/\bdo\b/gi, '')
    .replace(/\bda\b/gi, '')
    .replace(/\bno\b/gi, '')
    .replace(/\bna\b/gi, '')
    .replace(/\bem\b/gi, '')
    .replace(/pix/gi, '')
    .replace(/dinheiro/gi, '')
    .replace(/cartão/gi, '')
    .replace(/\bfiado\b/gi, '')
    .replace(/referente.*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const referencia =
    texto.match(/referente (.+)/i)?.[1] ?? ''

  return {
    cliente,
    valor,
    formaPagamento,
    referencia,
  }
}