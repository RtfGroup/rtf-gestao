export interface ItemCompraIA {
  nome: string
  quantidade: number
  valorUnitario: number
}

export interface CompraInterpretadaIA {
  fornecedor: string
  itens: ItemCompraIA[]
}

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function extrairValor(texto: string) {
  const valorEncontrado = texto.match(
    /(?:por|a|valor)\s*r?\$?\s*(\d+(?:[.,]\d+)?)/i,
  )

  if (!valorEncontrado) {
    return 0
  }

  return Number(
    valorEncontrado[1].replace(',', '.'),
  )
}

function extrairQuantidade(texto: string) {
  const quantidadeEncontrada = texto.match(
    /(\d+(?:[.,]\d+)?)\s*(?:un|und|unidade|unidades|kg|g)?/i,
  )

  if (!quantidadeEncontrada) {
    return 1
  }

  return Number(
    quantidadeEncontrada[1].replace(',', '.'),
  )
}

export function interpretarCompraIA(
  texto: string,
): CompraInterpretadaIA {
  const textoNormalizado = normalizarTexto(texto)

  const trechoFornecedor =
    textoNormalizado.match(
      /(?:fornecedor|da|do)\s+([^,.;]+)/,
    )?.[1] ?? 'Fornecedor não informado'

  const trechoProduto =
    textoNormalizado
      .replace(/comprei|compra|fornecedor/g, '')
      .replace(/(?:por|a|valor)\s*r?\$?\s*\d+(?:[.,]\d+)?/g, '')
      .replace(/\d+(?:[.,]\d+)?\s*(?:un|und|unidade|unidades|kg|g)?/g, '')
      .replace(/(?:da|do)\s+[^,.;]+/g, '')
      .trim()

  if (!trechoProduto) {
    throw new Error(
      'Não foi possível identificar o produto da compra.',
    )
  }

  const quantidade = extrairQuantidade(textoNormalizado)
  const valorUnitario = extrairValor(textoNormalizado)

  return {
    fornecedor: trechoFornecedor,
    itens: [
      {
        nome: trechoProduto,
        quantidade,
        valorUnitario,
      },
    ],
  }
}