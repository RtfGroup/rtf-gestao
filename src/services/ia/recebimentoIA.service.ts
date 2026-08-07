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

  const valorMatch = minusculo.match(
    /(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)/,
  )

  const valor = valorMatch
    ? Number(valorMatch[1].replace(',', '.'))
    : 0

  const formaPagamento =
    minusculo.includes('pix')
      ? 'PIX'
      : minusculo.includes('dinheiro')
      ? 'DINHEIRO'
      : minusculo.includes('cartão') ||
        minusculo.includes('cartao')
      ? 'CARTAO'
      : 'PIX'

  let cliente = texto

  cliente = cliente
    .replace(/dar\s+baixa\s+no\s+recebimento\s+(?:do|da|de)\s+/gi, '')
    .replace(/dar\s+baixa\s+no\s+recebimento/gi, '')
    .replace(/baixar\s+recebimento\s+(?:do|da|de)\s+/gi, '')
    .replace(/baixar\s+recebimento/gi, '')
    .replace(/\bcliente\s+/gi, '')
    .replace(/\brecebi\s+(?:do|da|de)\s+/gi, '')
    .replace(/\brecebi\b/gi, '')
    .replace(/\bpagou\s+(?:o\s+)?fiado\b/gi, '')
    .replace(/\bpagou\s+(?:a\s+)?conta\b/gi, '')
    .replace(/\bpagou\b/gi, '')
    .replace(/r\$\s*\d+(?:[.,]\d{1,2})?/gi, '')
    .replace(/\b\d+(?:[.,]\d{1,2})?\b/g, '')
    .replace(/\bno\s+pix\b/gi, '')
    .replace(/\bvia\s+pix\b/gi, '')
    .replace(/\bpix\b/gi, '')
    .replace(/\bem\s+dinheiro\b/gi, '')
    .replace(/\bdinheiro\b/gi, '')
    .replace(/\bno\s+cart[aã]o\b/gi, '')
    .replace(/\bcart[aã]o\b/gi, '')
    .replace(/\breferente\s+.+$/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/[.,;:]+$/g, '')
    .trim()

  const referencia =
    texto.match(/referente\s+(.+)/i)?.[1]?.trim() ?? ''

  return {
    cliente,
    valor,
    formaPagamento,
    referencia,
  }
}