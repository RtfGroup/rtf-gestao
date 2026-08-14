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

  let fornecedor = texto

  fornecedor = fornecedor
    .replace(/dar\s+baixa\s+no\s+pagamento\s+(?:da|do|de)\s+conta\s+(?:da|do|de)\s+/gi, '')
    .replace(/dar\s+baixa\s+no\s+pagamento\s+(?:da|do|de)\s+/gi, '')
    .replace(/dar\s+baixa\s+no\s+pagamento/gi, '')
    .replace(/baixar\s+pagamento\s+(?:da|do|de)\s+/gi, '')
    .replace(/baixar\s+pagamento/gi, '')
    .replace(/\bpaguei\s+(?:a\s+)?conta\s+(?:da|do|de)\s+/gi, '')
    .replace(/\bpaguei\s+(?:a\s+conta\s+)?(?:para|ao|à|a|do|da|de)\s+/gi, '')
.replace(/\bpaguei\b/gi, '')
.replace(/^\s*para\s+/gi, '')
    .replace(/\bpagar\s+fornecedor\s+/gi, '')
    .replace(/\bpagar\s+conta\s+(?:da|do|de)\s+/gi, '')
    .replace(/\bpagar\s+conta\b/gi, '')
    .replace(/\bconta\s+paga\b/gi, '')
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

    const fornecedorNormalizado = fornecedor
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()

const fornecedorGenerico =
  fornecedorNormalizado === '' ||
  fornecedorNormalizado === 'fornecedor' ||
  fornecedorNormalizado === 'um fornecedor' ||
  fornecedorNormalizado === 'para um fornecedor' ||
  fornecedorNormalizado === 'reais para um fornecedor'

if (fornecedorGenerico) {
  throw new Error(
    'Informe qual fornecedor deseja pagar.',
  )
}

  const referencia =
    texto.match(/referente\s+(.+)/i)?.[1]?.trim() ?? ''

  return {
    fornecedor,
    valor,
    formaPagamento,
    referencia,
  }
}