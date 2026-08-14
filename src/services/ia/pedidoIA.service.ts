import type {
  Cliente,
  FormaPagamento,
  ProdutoVenda,
} from '../vendas/vendas.service'

export interface ItemPedidoIA {
  produto_id: string
  produto_nome: string
  quantidade: number
  valor_unitario: number
}

export interface PedidoInterpretadoIA {
  cliente_id: string | null
  cliente_nome: string
  forma_pagamento_id: string
  forma_pagamento_nome: string
  tipo_venda: 'BALCAO' | 'DELIVERY' | 'WHATSAPP' | 'FIADO'
  itens: ItemPedidoIA[]
}

interface InterpretarPedidoParametros {
  texto: string
  produtos: ProdutoVenda[]
  clientes: Cliente[]
  formasPagamento: FormaPagamento[]
}

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function identificarTipoVenda(texto: string) {
  if (texto.includes('fiado')) {
    return 'FIADO' as const
  }

  if (texto.includes('delivery')) {
    return 'DELIVERY' as const
  }

  if (texto.includes('whatsapp')) {
    return 'WHATSAPP' as const
  }

  return 'BALCAO' as const
}

function obterApelidosProduto(nomeProduto: string) {
  const nome = normalizarTexto(nomeProduto)

  const apelidos: Record<string, string[]> = {
    'marmitex grande': [
      'marmitex g',
      'marmita g',
      'marmita grande',
    ],
    'marmitex media': [
      'marmitex m',
      'marmita m',
      'marmita media',
    ],
    'marmitex pequena': [
      'marmitex p',
      'marmita p',
      'marmita pequena',
    ],
    pf: ['prato feito'],
    coca: ['coca cola', 'coca-cola'],
  }

  return Array.from(
    new Set([
      nome,
      ...(apelidos[nome] ?? []),
    ]),
  )
}

function identificarQuantidade(texto: string, apelido: string) {
  const apelidoEscapado = apelido.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )

  const antes = texto.match(
    new RegExp(
      `(\\d+(?:[.,]\\d+)?)\\s*(?:un|und|unidade|unidades|kg|g)?\\s*${apelidoEscapado}`,
      'i',
    ),
  )

  if (antes) {
    return Number(antes[1].replace(',', '.'))
  }

  const depois = texto.match(
    new RegExp(
      `${apelidoEscapado}\\s*(\\d+(?:[.,]\\d+)?)`,
      'i',
    ),
  )

  if (depois) {
    return Number(depois[1].replace(',', '.'))
  }

  return 1
}

export function interpretarPedidoIA({
  texto,
  produtos,
  clientes,
  formasPagamento,
}: InterpretarPedidoParametros): PedidoInterpretadoIA {
  const textoNormalizado = normalizarTexto(texto)

  const tipoVenda = identificarTipoVenda(textoNormalizado)

  const formaPagamentoEncontrada =
  tipoVenda === 'FIADO'
    ? formasPagamento.find(
        (forma) =>
          normalizarTexto(forma.nome) === 'fiado',
      )
    : formasPagamento.find((forma) =>
        textoNormalizado.includes(
          normalizarTexto(forma.nome),
        ),
      ) ?? formasPagamento[0]

  if (!formaPagamentoEncontrada) {
    throw new Error(
      'Nenhuma forma de pagamento cadastrada foi encontrada.',
    )
  }

  const clienteEncontrado = clientes.find((cliente) =>
    textoNormalizado.includes(
      normalizarTexto(cliente.nome),
    ),
  )

  if (tipoVenda === 'FIADO' && !clienteEncontrado) {
    throw new Error(
      'Informe o cliente para registrar uma venda fiado.',
    )
  }

  const itens: ItemPedidoIA[] = []
  const produtosIdentificados = new Set<string>()

  produtos.forEach((produto) => {
    const apelidos = obterApelidosProduto(produto.nome)

    const apelidoEncontrado = apelidos
      .sort((a, b) => b.length - a.length)
      .find((apelido) =>
        textoNormalizado.includes(apelido),
      )

    if (!apelidoEncontrado) {
  return
}

const nomeProduto =
  normalizarTexto(produto.nome)

const existeProdutoMaisEspecifico =
  produtos.some((outroProduto) => {
    if (outroProduto.id === produto.id) {
      return false
    }

    const outroNome =
      normalizarTexto(outroProduto.nome)

    return (
      outroNome.length > nomeProduto.length &&
      textoNormalizado.includes(outroNome) &&
      (
        outroNome.includes(nomeProduto) ||
        outroNome.includes(
          normalizarTexto(apelidoEncontrado),
        )
      )
    )
  })

if (existeProdutoMaisEspecifico) {
  return
}

const chaveProduto = normalizarTexto(produto.nome)

if (produtosIdentificados.has(chaveProduto)) {
  return
}

produtosIdentificados.add(chaveProduto)

itens.push({
      produto_id: produto.id,
      produto_nome: produto.nome,
      quantidade: identificarQuantidade(
        textoNormalizado,
        apelidoEncontrado,
      ),
      valor_unitario: Number(
        produto.preco_venda ?? 0,
      ),
    })
  })

  if (itens.length === 0) {
    throw new Error(
      'Nenhum produto cadastrado foi identificado no pedido.',
    )
  }

  return {
    cliente_id: clienteEncontrado?.id ?? null,
    cliente_nome:
      clienteEncontrado?.nome ?? 'Consumidor final',
    forma_pagamento_id: formaPagamentoEncontrada.id,
    forma_pagamento_nome: formaPagamentoEncontrada.nome,
    tipo_venda: tipoVenda,
    itens,
  }
}