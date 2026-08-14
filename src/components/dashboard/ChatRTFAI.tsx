import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import { supabase } from '../../lib/supabase'

import {
  interpretarPedidoIA,
  vendasService,
} from '../../services/ia/vendasIA.service'

import type {
  Cliente,
  FormaPagamento,
  ProdutoVenda,
} from '../../services/vendas/vendas.service'

import type {
  PedidoInterpretadoIA,
} from '../../services/ia/pedidoIA.service'

import { identificarComandoIA } from '../../services/ia/comandoIA.service'
import { interpretarCompraIA } from '../../services/ia/compraIA.service'
import { interpretarRecebimentoIA } from '../../services/ia/recebimentoIA.service'
import { interpretarPagamentoIA } from '../../services/ia/pagamentoIA.service'
import {
  gerarRespostaAnaliseFinanceira,
  interpretarAnaliseFinanceiraIA,
} from '../../services/ia/analiseFinanceiraIA.service'

import {
  localizarContaReceber,
  registrarBaixaRecebimento,
} from '../../services/ia/baixaRecebimentoIA.service'

import {
  localizarContaPagar,
  registrarBaixaPagamento,
} from '../../services/ia/baixaPagamentoIA.service'

import { comprasService } from '../../services/compras'
import { criarProduto } from '../../services/produtos'
import { obterResumoDashboard } from './resumoDashboard.service'

interface ContextoUsuario {
  empresaId: string
  usuarioId: string
}

export default function ChatRTFAI() {
  const [mensagem, setMensagem] = useState('')
  const [resposta, setResposta] = useState(
    'Aguardando comandos...',
  )

  const [empresaId, setEmpresaId] = useState('')
  const [usuarioId, setUsuarioId] = useState('')

  const [produtos, setProdutos] =
    useState<ProdutoVenda[]>([])

  const [clientes, setClientes] =
    useState<Cliente[]>([])

  const [formasPagamento, setFormasPagamento] =
    useState<FormaPagamento[]>([])

  const [pedidoPendente, setPedidoPendente] =
    useState<PedidoInterpretadoIA | null>(null)

  const [compraPendente, setCompraPendente] =
    useState<
      ReturnType<typeof interpretarCompraIA> | null
    >(null)

  const [recebimentoPendente, setRecebimentoPendente] =
    useState<{
      contaId: string
      cliente: string
      valor: number
      formaPagamento: string
    } | null>(null)

  const [pagamentoPendente, setPagamentoPendente] =
    useState<{
      contaId: string
      fornecedor: string
      valor: number
      formaPagamento: string
    } | null>(null)

  const [carregando, setCarregando] =
    useState(true)

  const [processando, setProcessando] =
    useState(false)

  const [erro, setErro] = useState('')

  const [resumoDashboard, setResumoDashboard] = useState({
  saldoCaixa: 0,
  vendasHoje: 0,
  vendasMes: 0,
  receber: 0,
  pagar: 0,

  melhorCliente: undefined as string | undefined,
  valorMelhorCliente: undefined as number | undefined,

  clientesEmAberto: [] as {
    nome: string
    saldo: number
  }[],
  clienteMaiorDebito: undefined as string | undefined,
valorClienteMaiorDebito: undefined as number | undefined,
})

  useEffect(() => {
    void carregarDados()
  }, [])

  async function obterContextoUsuario(): Promise<ContextoUsuario> {
    const {
  data: { user },
  error: erroUsuario,
} = await supabase.auth.getUser()

    if (erroUsuario || !user) {
      throw new Error('Usuário não autenticado.')
    }

    const { data: usuario, error: erroPerfil } =
      await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (erroPerfil) {
      throw erroPerfil
    }

    if (!usuario?.empresa_id) {
      throw new Error(
        'Usuário sem empresa vinculada.',
      )
    }

    return {
      empresaId: usuario.empresa_id,
      usuarioId: user.id,
    }
  }

  async function carregarDados() {
    try {
      setCarregando(true)
      setErro('')

      const contexto = await obterContextoUsuario()
const resumoAtual = await obterResumoDashboard(
  contexto.empresaId,
)

      const [
        listaProdutos,
        listaClientes,
        listaFormasPagamento,
      ] = await Promise.all([
        vendasService.listarProdutos(contexto.empresaId),
        vendasService.listarClientes(contexto.empresaId),
        vendasService.listarFormasPagamento(
          contexto.empresaId,
        ),
      ])

      setEmpresaId(contexto.empresaId)
      setUsuarioId(contexto.usuarioId)
      setProdutos(listaProdutos)
      setClientes(listaClientes)
      setFormasPagamento(listaFormasPagamento)
      setResumoDashboard(resumoAtual)
    } catch (error) {
      console.error('Erro ao carregar RTF AI:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar a RTF AI.',
      )
    } finally {
      setCarregando(false)
    }
  }

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  function montarResumoPedido(
    pedido: PedidoInterpretadoIA,
  ) {
    const linhas = pedido.itens.map((item) => {
      const total =
        item.quantidade * item.valor_unitario

      return `${item.quantidade}x ${item.produto_nome} — ${formatarMoeda(total)}`
    })

    const totalVenda = pedido.itens.reduce(
      (total, item) =>
        total +
        item.quantidade * item.valor_unitario,
      0,
    )

    return [
      '✅ Venda identificada.',
      '',
      ...linhas,
      '',
      `Cliente: ${pedido.cliente_nome}`,
      `Tipo: ${pedido.tipo_venda}`,
      `Pagamento: ${pedido.forma_pagamento_nome}`,
      `Total: ${formatarMoeda(totalVenda)}`,
      '',
      'Confirme para registrar a venda.',
    ].join('\n')
  }

async function enviar() {
  try {
    setErro('')
    setPedidoPendente(null)
    await carregarDados()
setCompraPendente(null)
setRecebimentoPendente(null)
setPagamentoPendente(null)

    const texto = mensagem.trim()

    if (!texto) {
      return
    }

    const tipoComando = identificarComandoIA(texto)

    if (tipoComando === 'VENDA') {
      const pedido = interpretarPedidoIA({
        texto,
        produtos,
        clientes,
        formasPagamento,
      })

      setPedidoPendente(pedido)
      setResposta(montarResumoPedido(pedido))
    } else if (tipoComando === 'COMPRA') {
  const compra = interpretarCompraIA(texto)
  setCompraPendente(compra)

  const linhas = compra.itens.map(
    (item) =>
      `${item.quantidade}x ${item.nome} — ${formatarMoeda(
        item.quantidade * item.valorUnitario,
      )}`,
  )

  setResposta(
    [
      '📦 Compra identificada.',
      '',
      ...linhas,
      '',
      `Fornecedor: ${compra.fornecedor}`,
      '',
      'Na próxima etapa vamos registrar essa compra no sistema.',
    ].join('\n'),
  )

  setMensagem('')
return

} else if (tipoComando === 'ESTOQUE') {
  const comandoEstoque = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  const { data: estoqueBanco, error: erroEstoque } =
    await supabase
      .from('estoque')
      .select(`
        quantidade_atual,
        produtos (
          nome,
          estoque_minimo
        )
      `)
      .eq('empresa_id', empresaId)

  if (erroEstoque) {
    throw erroEstoque
  }

  const itens = estoqueBanco ?? []

  if (
    comandoEstoque.includes('estoque baixo') ||
    comandoEstoque.includes('abaixo do minimo')
  ) {
    const baixos = itens.filter((item: any) => {
      const produto = Array.isArray(item.produtos)
        ? item.produtos[0]
        : item.produtos

      return (
        Number(item.quantidade_atual ?? 0) <=
        Number(produto?.estoque_minimo ?? 0)
      )
    })

    setResposta(
      `📦 Existem ${baixos.length} produtos com estoque baixo.`,
    )
  } else if (
    comandoEstoque.includes('menos estoque') ||
    comandoEstoque.includes('menor estoque')
  ) {
    const menor = [...itens].sort(
      (a, b) =>
        Number(a.quantidade_atual ?? 0) -
        Number(b.quantidade_atual ?? 0),
    )[0]

    const produto = Array.isArray(menor?.produtos)
      ? menor.produtos[0]
      : menor?.produtos

    setResposta(
      menor
        ? `📉 Produto com menor estoque: ${
            produto?.nome ?? 'Produto'
          } — ${Number(menor.quantidade_atual ?? 0)} unidades.`
        : '📦 Nenhum produto encontrado no estoque.',
    )
  } else if (
    comandoEstoque.includes('quantos produtos')
  ) {
    setResposta(
      `📊 Existem ${itens.length} produtos cadastrados no estoque.`,
    )
  } else {
    setResposta(
      `📦 Existem ${itens.length} produtos no estoque.`,
    )
  }

} else if (tipoComando === 'CAIXA') {
  const comandoFinanceiro = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (
    comandoFinanceiro.includes('para receber') ||
    comandoFinanceiro.includes('contas a receber')
  ) {
    setResposta(
      `💵 Total a receber: ${formatarMoeda(
        resumoDashboard.receber,
      )}`,
    )
  } else if (
    comandoFinanceiro.includes('para pagar') ||
    comandoFinanceiro.includes('contas a pagar')
  ) {
    setResposta(
      `💸 Total a pagar: ${formatarMoeda(
        resumoDashboard.pagar,
      )}`,
    )
  } else if (
    comandoFinanceiro.includes('vendi hoje') ||
    comandoFinanceiro.includes('vendas de hoje')
  ) {
    setResposta(
      `📈 Vendas de hoje: ${formatarMoeda(
        resumoDashboard.vendasHoje,
      )}`,
    )
  } else if (
    comandoFinanceiro.includes('vendi este mes') ||
    comandoFinanceiro.includes('vendi esse mes') ||
    comandoFinanceiro.includes('vendas do mes') ||
    comandoFinanceiro.includes('faturamento')
  ) {
    setResposta(
      `📊 Vendas do mês: ${formatarMoeda(
        resumoDashboard.vendasMes,
      )}`,
    )
  } else {
    setResposta(
      `💰 Saldo do caixa: ${formatarMoeda(
        resumoDashboard.saldoCaixa,
      )}`,
    )
  }

} else if (tipoComando === 'RECEBIMENTO') {
  const recebimento = interpretarRecebimentoIA(texto)

  const conta = await localizarContaReceber(
    empresaId,
    recebimento.cliente,
  )

  if (!conta) {
    setResposta(
      `❌ Nenhuma conta em aberto encontrada para ${recebimento.cliente}.`,
    )
    setMensagem('')
    return
  }

  const valorRecebimento =
  recebimento.valor > 0
    ? recebimento.valor
    : Number(conta.saldo_pendente ?? 0)

setRecebimentoPendente({
  contaId: conta.id,
  cliente: recebimento.cliente,
  valor: valorRecebimento,
  formaPagamento: recebimento.formaPagamento,
})

  setResposta(
    [
      '💵 Recebimento identificado.',
      '',
      `Cliente: ${recebimento.cliente}`,
      `Valor: ${formatarMoeda(valorRecebimento)}`,
      `Forma de pagamento: ${recebimento.formaPagamento}`,
      recebimento.referencia
        ? `Referência: ${recebimento.referencia}`
        : '',
      '',
      'Confirme para registrar a baixa.',
    ]
      .filter(Boolean)
      .join('\n'),
  )

    } else if (tipoComando === 'PAGAMENTO') {
  const pagamento = interpretarPagamentoIA(texto)

const conta = await localizarContaPagar(
  empresaId,
  pagamento.fornecedor,
  pagamento.valor,
)

if (!conta) {
  setResposta(
`❌ Nenhuma conta em aberto encontrada para ${pagamento.fornecedor}.`,
  )

  setMensagem('')
  return
}

const valorPagamento =
  pagamento.valor > 0
    ? pagamento.valor
    : Number(conta.saldo_pendente ?? 0)

setPagamentoPendente({
  contaId: conta.id,
  fornecedor: pagamento.fornecedor,
  valor: valorPagamento,
  formaPagamento: pagamento.formaPagamento,
})

if (!conta) {
  setResposta(
    `❌ Nenhuma conta em aberto encontrada para ${pagamento.fornecedor}.`,
  )
  return
}

setResposta(
  [
    `💸 Pagamento identificado.`,
    '',
    `Fornecedor: ${pagamento.fornecedor}`,
    `Valor: ${formatarMoeda(valorPagamento)}`,
    `Forma de pagamento: ${pagamento.formaPagamento}`,
    pagamento.referencia
      ? `Referência: ${pagamento.referencia}`
      : '',
    '',
    'Confirme para registrar o pagamento.',
  ]
    .filter(Boolean)
    .join('\n'),
)


  const clientesEmAberto =
    resumoDashboard.clientesEmAberto ?? []

  if (clientesEmAberto.length === 0) {
    setResposta(
      '✅ Não existem clientes com valores em aberto para cobrar.',
    )
  } else {
    const clientesAgrupados = Object.values(
      clientesEmAberto.reduce(
        (
          acumulador: Record<
            string,
            {
              nome: string
              saldo: number
            }
          >,
          cliente,
        ) => {
          const chave = cliente.nome
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()

          if (!acumulador[chave]) {
            acumulador[chave] = {
              nome: cliente.nome,
              saldo: 0,
            }
          }

          acumulador[chave].saldo += cliente.saldo

          return acumulador
        },
        {},
      ),
    )

    const clientesOrdenados =
      clientesAgrupados.sort(
        (a, b) => b.saldo - a.saldo,
      )

    const principal = clientesOrdenados[0]

    setResposta(
      [
        '🎯 Cobrança prioritária:',
        '',
        `${principal.nome} — ${formatarMoeda(
          principal.saldo,
        )}`,
        '',
        'Esse cliente deve ser priorizado por ter o maior valor em aberto.',
        '',
        clientesOrdenados.length > 1
          ? `Próximo da lista: ${clientesOrdenados[1].nome} — ${formatarMoeda(
              clientesOrdenados[1].saldo,
            )}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  } else if (tipoComando === 'RECEBER_E_DEVEDORES') {
  const clientesEmAberto =
    resumoDashboard.clientesEmAberto ?? []

  const clientesAgrupados = Object.values(
    clientesEmAberto.reduce(
      (
        acumulador: Record<
          string,
          {
            nome: string
            saldo: number
          }
        >,
        cliente,
      ) => {
        const chave = cliente.nome
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()

        if (!acumulador[chave]) {
          acumulador[chave] = {
            nome: cliente.nome,
            saldo: 0,
          }
        }

        acumulador[chave].saldo += cliente.saldo

        return acumulador
      },
      {},
    ),
  )

  const clientesOrdenados =
    clientesAgrupados.sort(
      (a, b) => b.saldo - a.saldo,
    )

  const linhas = clientesOrdenados.map(
    (cliente, indice) =>
      `${indice + 1}. ${cliente.nome} — ${formatarMoeda(
        cliente.saldo,
      )}`,
  )

  setResposta(
    [
      `💵 Total a receber: ${formatarMoeda(
        resumoDashboard.receber,
      )}`,
      '',
      '💳 Clientes com valores em aberto:',
      '',
      ...linhas,
      '',
      clientesOrdenados.length > 0
        ? `⚠️ Maior devedor: ${clientesOrdenados[0].nome} — ${formatarMoeda(
            clientesOrdenados[0].saldo,
          )}`
        : '✅ Nenhum cliente possui valor em aberto.',
    ].join('\n'),
  )

} else if (tipoComando === 'DEVEDORES') {

  const clientesEmAberto =
    resumoDashboard.clientesEmAberto ?? []

  if (clientesEmAberto.length === 0) {
    setResposta(
      '✅ Não existem clientes com valores em aberto no momento.',
    )
  } else {
    const clientesAgrupados = Object.values(
  clientesEmAberto.reduce(
    (
      acumulador: Record<
        string,
        {
          nome: string
          saldo: number
        }
      >,
      cliente,
    ) => {
      const chave = cliente.nome
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()

      if (!acumulador[chave]) {
        acumulador[chave] = {
          nome: cliente.nome,
          saldo: 0,
        }
      }

      acumulador[chave].saldo += cliente.saldo

      return acumulador
    },
    {},
  ),
)

const clientesOrdenados =
  clientesAgrupados.sort(
    (a, b) => b.saldo - a.saldo,
  )

    const totalAberto = clientesOrdenados.reduce(
      (total, cliente) => total + cliente.saldo,
      0,
    )

    const linhas = clientesOrdenados.map(
      (cliente, indice) =>
        `${indice + 1}. ${cliente.nome} — ${formatarMoeda(
          cliente.saldo,
        )}`,
    )

    setResposta(
      [
        '💳 Clientes com valores em aberto:',
        '',
        ...linhas,
        '',
        `Total a receber: ${formatarMoeda(totalAberto)}`,
        '',
        `⚠️ Maior devedor: ${clientesOrdenados[0].nome} — ${formatarMoeda(
          clientesOrdenados[0].saldo,
        )}`,
      ].join('\n'),
    )
  }

    setMensagem('')
  return

  } else if (
  tipoComando === 'MAIOR_PROBLEMA_E_PRIORIDADES'
) {
  const analiseMaiorProblema =
    interpretarAnaliseFinanceiraIA(
      'qual meu maior problema',
    )

  const respostaMaiorProblema =
    gerarRespostaAnaliseFinanceira(
      analiseMaiorProblema,
      resumoDashboard,
      formatarMoeda,
    )

  const prioridades: string[] = []

  if (resumoDashboard.pagar > 0) {
    prioridades.push(
      `💸 Revise as contas a pagar. Existem ${formatarMoeda(
        resumoDashboard.pagar,
      )} em compromissos pendentes.`,
    )
  }

  if (resumoDashboard.receber > 0) {
    prioridades.push(
      `💳 Faça cobranças hoje. Existem ${formatarMoeda(
        resumoDashboard.receber,
      )} a receber.`,
    )
  }

  if (
    resumoDashboard.saldoCaixa <
    resumoDashboard.pagar
  ) {
    prioridades.push(
      `⚠️ Preserve o caixa. Você possui ${formatarMoeda(
        resumoDashboard.saldoCaixa,
      )} disponível e as contas a pagar estão acima desse valor.`,
    )
  }

  setResposta(
    [
      respostaMaiorProblema,
      '',
      '🎯 O que fazer hoje:',
      '',
      ...prioridades
        .slice(0, 3)
        .map(
          (prioridade, indice) =>
            `${indice + 1}. ${prioridade}`,
        ),
    ].join('\n'),
  )

  } else if (tipoComando === 'PRIORIDADES_HOJE') {
  const prioridades: string[] = []

  if (resumoDashboard.pagar > 0) {
    prioridades.push(
      `💸 Revise as contas a pagar. Existem ${formatarMoeda(
        resumoDashboard.pagar,
      )} em compromissos pendentes.`,
    )
  }

  if (resumoDashboard.receber > 0) {
    prioridades.push(
      `💳 Faça cobranças hoje. Existem ${formatarMoeda(
        resumoDashboard.receber,
      )} a receber.`,
    )
  }

  if (
    resumoDashboard.saldoCaixa <
    resumoDashboard.pagar
  ) {
    prioridades.push(
      `⚠️ Preserve o caixa. Você possui ${formatarMoeda(
        resumoDashboard.saldoCaixa,
      )} disponível e as contas a pagar estão acima desse valor.`,
    )
  }

  if (prioridades.length === 0) {
    prioridades.push(
      '✅ Não há nenhuma urgência financeira identificada hoje.',
    )
  }

  setResposta(
    [
      '🎯 Suas prioridades de hoje:',
      '',
      ...prioridades
        .slice(0, 3)
        .map(
          (prioridade, indice) =>
            `${indice + 1}. ${prioridade}`,
        ),
    ].join('\n'),
  )

} else if (tipoComando === 'ANALISE') {
  const analise = interpretarAnaliseFinanceiraIA(texto)

if (analise.tipo === 'PRIORIZAR_CONTAS') {
  const { data: contasPrioridade, error: erroContas } =
  await supabase
    .from('contas_pagar')
    .select(`
      id,
      fornecedor_id,
      descricao,
      valor_original,
      valor_pago,
      data_vencimento,
      status
    `)
    .eq('empresa_id', empresaId)
    .neq('status', 'PAGO')
    .order('data_vencimento', {
  ascending: true,
})
.limit(20)

if (erroContas) {
  throw erroContas
}

const contas = contasPrioridade ?? []

const hoje = new Date()
hoje.setHours(0, 0, 0, 0)

const contasOrdenadas = [...contas]
  .map((conta) => {
    const saldo =
      Number(conta.valor_original ?? 0) -
      Number(conta.valor_pago ?? 0)

    const dataVencimento = conta.data_vencimento
      ? new Date(`${conta.data_vencimento}T00:00:00`)
      : null

    const vencida =
      dataVencimento !== null &&
      dataVencimento < hoje

    return {
      ...conta,
      saldo,
      dataVencimento,
      vencida,
    }
  })
  .sort((a, b) => {
    if (a.vencida !== b.vencida) {
      return a.vencida ? -1 : 1
    }

    if (a.vencida && b.vencida) {
      return b.saldo - a.saldo
    }

    const dataA =
      a.dataVencimento?.getTime() ??
      Number.MAX_SAFE_INTEGER

    const dataB =
      b.dataVencimento?.getTime() ??
      Number.MAX_SAFE_INTEGER

    return dataA - dataB
  })
  .slice(0, 5)

const idsFornecedores = [
  ...new Set(
    contas
      .map((conta) => conta.fornecedor_id)
      .filter(Boolean),
  ),
]

let fornecedoresBanco: {
  id: string
  nome_fantasia: string | null
  razao_social: string | null
}[] = []

if (idsFornecedores.length > 0) {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('id,nome_fantasia,razao_social')
    .in('id', idsFornecedores)

  if (error) {
    throw error
  }

  fornecedoresBanco = data ?? []
}

if (contas.length === 0) {
  setResposta(
    '✅ Não existem contas a pagar pendentes no momento.',
  )
} else {
  const linhas = contasOrdenadas.map((conta, indice) => {
    const fornecedor = fornecedoresBanco.find(
      (item) => item.id === conta.fornecedor_id,
    )

    const nomeFornecedor =
  fornecedor?.nome_fantasia ||
  fornecedor?.razao_social ||
  'Fornecedor não informado'

const descricaoConta =
  conta.descricao ||
  'Conta sem descrição'

    const saldo =
      Number(conta.valor_original ?? 0) -
      Number(conta.valor_pago ?? 0)

    return `${indice + 1}. ${nomeFornecedor}
   ${descricaoConta}
   ${formatarMoeda(saldo)} — vence em ${
     conta.data_vencimento ?? 'data não informada'
   }`
  })

  setResposta(
    [
      '📌 Contas que devem ser priorizadas:',
      '',
      ...linhas,
      '',
      '🎯 Prioridade: contas vencidas primeiro, considerando também o maior impacto financeiro.',
    ].join('\n'),
  )
}
} else {
  const respostaAnalise =
    gerarRespostaAnaliseFinanceira(
      analise,
      resumoDashboard,
      formatarMoeda,
    )

  setResposta(respostaAnalise)
}

} else {
  setResposta('Ainda não aprendi esse comando.')
}

    setMensagem('')
  } catch (error) {
    console.error('Erro ao interpretar comando:', error)

    setErro(
      error instanceof Error
        ? error.message
        : 'Não foi possível interpretar o comando.',
    )
  }
}
async function confirmarVenda() {
  try {
    setErro('')

    if (!pedidoPendente) {
      return
    }

    if (!empresaId || !usuarioId) {
      throw new Error(
        'Não foi possível identificar o usuário e a empresa.',
      )
    }

    setProcessando(true)

    await vendasService.registrarVenda({
      empresa_id: empresaId,
      usuario_id: usuarioId,
      cliente_id: pedidoPendente.cliente_id,
      forma_pagamento_id:
        pedidoPendente.forma_pagamento_id,
      data_venda: `${new Date()
        .toISOString()
        .split('T')[0]}T12:00:00`,
      tipo_venda: pedidoPendente.tipo_venda,
      desconto: 0,
      acrescimo: 0,
      observacoes: 'Venda registrada pela RTF AI',
      numero_parcelas: 1,
      itens: pedidoPendente.itens.map((item) => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        desconto: 0,
      })),
    })

    const totalVenda = pedidoPendente.itens.reduce(
      (total, item) =>
        total +
        item.quantidade * item.valor_unitario,
      0,
    )

    setResposta(
      [
        '✅ Venda registrada com sucesso.',
        '',
        `Total: ${formatarMoeda(totalVenda)}`,
        '',
        'Estoque, financeiro e Dashboard foram atualizados.',
      ].join('\n'),
    )

    setPedidoPendente(null)
  } catch (error) {
    console.error(
      'Erro ao registrar venda pela IA:',
      error,
    )

    setErro(
      error instanceof Error
        ? error.message
        : 'Não foi possível registrar a venda.',
    )
  } finally {
    setProcessando(false)
  }
}

async function confirmarCompra() {
  try {
    setErro('')

    if (!compraPendente) {
      return
    }

    if (!empresaId) {
      throw new Error(
        'Não foi possível identificar a empresa.',
      )
    }

    setProcessando(true)

    const nomeFornecedor =
      compraPendente.fornecedor.trim()

    const { data: fornecedoresBanco, error: erroFornecedores } =
      await supabase
        .from('fornecedores')
        .select('id,razao_social,nome_fantasia')
        .eq('empresa_id', empresaId)

    if (erroFornecedores) {
      throw erroFornecedores
    }

    const normalizar = (texto: string) =>
      texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')

    const fornecedorNormalizado =
      normalizar(nomeFornecedor)

    let fornecedorEncontrado =
      (fornecedoresBanco ?? []).find((item) => {
        const razaoSocial = normalizar(
          item.razao_social ?? '',
        )

        const nomeFantasia = normalizar(
          item.nome_fantasia ?? '',
        )

        return (
          razaoSocial === fornecedorNormalizado ||
          nomeFantasia === fornecedorNormalizado ||
          razaoSocial.includes(fornecedorNormalizado) ||
          fornecedorNormalizado.includes(razaoSocial) ||
          nomeFantasia.includes(fornecedorNormalizado) ||
          fornecedorNormalizado.includes(nomeFantasia)
        )
      })

    if (!fornecedorEncontrado) {
      const { data: novoFornecedor, error: erroCriacao } =
        await supabase
          .from('fornecedores')
          .insert({
            empresa_id: empresaId,
            razao_social: nomeFornecedor,
            nome_fantasia: nomeFornecedor,
            ativo: true,
          })
          .select('id,razao_social,nome_fantasia')
          .single()

      if (erroCriacao) {
        throw erroCriacao
      }

      fornecedorEncontrado = novoFornecedor
    }

    const { data: produtosBanco, error: erroProdutos } =
      await supabase
        .from('produtos')
        .select('id,nome')
        .eq('empresa_id', empresaId)

    if (erroProdutos) {
      throw erroProdutos
    }

    const produtosDisponiveis = [
      ...(produtosBanco ?? []),
    ]

    const itensCompra = []

    for (const item of compraPendente.itens) {
      const nomeProdutoNormalizado =
        normalizar(item.nome)

      let produtoEncontrado =
        produtosDisponiveis.find(
          (produto) =>
            normalizar(produto.nome ?? '') ===
            nomeProdutoNormalizado,
        )

      if (!produtoEncontrado) {
        const novoProduto = await criarProduto({
          nome: item.nome,
          descricao: 'Produto criado pela RTF AI',
          categoria_id: '',
          codigo: '',
          codigo_barras: '',
          tipo: 'produto',
          unidade_medida: 'UN',
          preco_custo: item.valorUnitario,
          preco_venda: item.valorUnitario,
          controla_estoque: true,
          estoque_minimo: 0,
          estoque_maximo: null,
          ativo: true,
        })

        produtoEncontrado = novoProduto
        produtosDisponiveis.push(novoProduto)
      }

if (!produtoEncontrado) {
  throw new Error(
    `Não foi possível localizar ou criar o produto ${item.nome}.`,
  )
}

      itensCompra.push({
        produto_id: produtoEncontrado.id,
        quantidade: item.quantidade,
        valor_unitario: item.valorUnitario,
      })
    }

    const { data: numeroCompra, error: erroNumero } =
      await supabase.rpc('gerar_numero_compra', {
        p_empresa_id: empresaId,
      })

    if (erroNumero) {
      throw erroNumero
    }

    await comprasService.registrarCompra({
      empresa_id: empresaId,
      fornecedor_id: fornecedorEncontrado.id,
      numero_compra: numeroCompra ?? undefined,
      data_compra: new Date().toISOString().split('T')[0],
      gera_contas_pagar: false,
      observacoes: 'Compra registrada pela RTF AI',
      itens: itensCompra,
    })

    const totalCompra =
      compraPendente.itens.reduce(
        (total, item) =>
          total +
          item.quantidade * item.valorUnitario,
        0,
      )

    setResposta(
      [
        '✅ Compra registrada com sucesso.',
        '',
        `Fornecedor: ${nomeFornecedor}`,
        `Total: ${formatarMoeda(totalCompra)}`,
        '',
        'Estoque, contas a pagar e Dashboard foram atualizados.',
      ].join('\n'),
    )

    setCompraPendente(null)

    await carregarDados()
  } catch (error) {
    console.error(
      'Erro ao registrar compra pela IA:',
      error,
    )

    setErro(
      error instanceof Error
        ? error.message
        : 'Não foi possível registrar a compra.',
    )
  } finally {
    setProcessando(false)
  }
}

async function confirmarRecebimento() {
  try {
    setErro('')

    if (!recebimentoPendente) {
      return
    }

    setProcessando(true)

    await registrarBaixaRecebimento({
      contaId: recebimentoPendente.contaId,
      valor: recebimentoPendente.valor,
      formaPagamento:
        recebimentoPendente.formaPagamento,
    })

    setResposta(
      [
        '✅ Recebimento registrado com sucesso.',
        '',
        `Cliente: ${recebimentoPendente.cliente}`,
        `Valor: ${formatarMoeda(
          recebimentoPendente.valor,
        )}`,
        `Forma de pagamento: ${recebimentoPendente.formaPagamento}`,
        '',
        'Conta a receber, caixa e Dashboard foram atualizados.',
      ].join('\n'),
    )

    setRecebimentoPendente(null)

    await carregarDados()
  } catch (error) {
    console.error(
      'Erro ao registrar recebimento pela IA:',
      error,
    )

    setErro(
      error instanceof Error
        ? error.message
        : 'Não foi possível registrar o recebimento.',
    )
  } finally {
    setProcessando(false)
  }
}

  if (carregando) {
    return (
      <Paper
        sx={{
          p: 3,
          mt: 4,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Paper>
    )
  }

  return (
    <Paper
  elevation={0}
  sx={{
    p: {
      xs: 2,
      md: 2,
    },
    mt: 0,
    borderRadius: '16px',
    background:
      'linear-gradient(145deg, #0d1b2e 0%, #101f35 100%)',
    border:
      '1px solid rgba(212,175,55,0.18)',
    boxShadow:
      '0 12px 34px rgba(0,0,0,0.20)',
    height: 310,
minHeight: 310,
display: 'flex',
flexDirection: 'column',
boxSizing: 'border-box',
  }}
>
  <Typography
    variant="h5"
    sx={{
      fontWeight: 800,
      color: '#f8fafc',
      letterSpacing: '-0.02em',
    }}
  >
    RTF AI
  </Typography>

  <Typography
    sx={{
      mb: 2,
      color: '#94a3b8',
      fontSize: '0.92rem',
    }}
  >
    Converse com o ERP.
  </Typography>

  {erro && (
    <Alert
      severity="error"
      onClose={() => setErro('')}
      sx={{ mb: 2 }}
    >
      {erro}
    </Alert>
  )}

  <Paper
    variant="outlined"
    sx={{
      p: 1.7,
      height: 138,
flexShrink: 0,
      mb: 2,
      overflow: 'auto',

      borderRadius: '12px',

        background:
  'linear-gradient(135deg, #0d1b2e 0%, #10213b 55%, #0b1728 100%)',

      border:
        '1px solid rgba(212,175,55,0.25)',

      boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.02)',

      '&::-webkit-scrollbar': {
        width: '6px',
      },

      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },

      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(212,175,55,0.28)',
        borderRadius: '10px',
      },
    }}
  >
    <Typography
      sx={{
        whiteSpace: 'pre-line',
        color: '#dbe5f1',
        lineHeight: 1.2,
      }}
    >
      {resposta}
    </Typography>
  </Paper>

{recebimentoPendente && (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 1,
      mb: 2,
    }}
  >
    <Button
      variant="outlined"
      disabled={processando}
      onClick={() => {
        setRecebimentoPendente(null)
        setResposta('Recebimento cancelado.')
      }}
    >
      Cancelar
    </Button>

    <Button
      variant="contained"
      disabled={processando}
      onClick={() => void confirmarRecebimento()}
    >
      {processando
        ? 'Registrando...'
        : 'Confirmar recebimento'}
    </Button>
  </Box>
)}

{pagamentoPendente && (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 1,
      mb: 2,
    }}
  >
    <Button
      variant="outlined"
      disabled={processando}
      onClick={() => {
        setPagamentoPendente(null)
        setResposta('Pagamento cancelado.')
      }}
    >
      Cancelar
    </Button>

    <Button
      variant="contained"
      disabled={processando}
      onClick={async () => {
        try {
          setErro('')
          setProcessando(true)

          await registrarBaixaPagamento(
            pagamentoPendente.contaId,
            pagamentoPendente.valor,
          )

          setResposta(
            [
              '✅ Pagamento registrado com sucesso.',
              '',
              `Fornecedor: ${pagamentoPendente.fornecedor}`,
              `Valor: ${formatarMoeda(
                pagamentoPendente.valor,
              )}`,
              `Forma de pagamento: ${pagamentoPendente.formaPagamento}`,
              '',
              'Conta a pagar, caixa e Dashboard foram atualizados.',
            ].join('\n'),
          )

          setPagamentoPendente(null)

          await carregarDados()
        } catch (error) {
          console.error(
            'Erro ao registrar pagamento pela IA:',
            error,
          )

          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível registrar o pagamento.',
          )
        } finally {
          setProcessando(false)
        }
      }}
    >
      {processando
        ? 'Registrando...'
        : 'Confirmar pagamento'}
    </Button>
  </Box>
)}

      {compraPendente && (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 1,
      mb: 2,
    }}
  >
    <Button
      variant="outlined"
      disabled={processando}
      onClick={() => {
        setCompraPendente(null)
        setResposta('Compra cancelada.')
      }}
    >
      Cancelar
    </Button>

    <Button
  variant="contained"
  disabled={processando}
  onClick={() => void confirmarCompra()}
>
  {processando
    ? 'Registrando...'
    : 'Confirmar compra'}
</Button>
  </Box>
)}

      {pedidoPendente && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            mb: 2,
          }}
        >
          <Button
            variant="outlined"
            disabled={processando}
            onClick={() => {
              setPedidoPendente(null)
              setResposta('Venda cancelada.')
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            disabled={processando}
            onClick={() => void confirmarVenda()}
          >
            {processando
              ? 'Registrando...'
              : 'Confirmar venda'}
          </Button>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 2,
        }}
      >

<Button
  variant="outlined"
  onClick={() => {
  window.location.href = '/compras/nova?lerNota=1'
}}
  sx={{
    height: 54,
    minWidth: 130,
    px: 2,
    borderRadius: '12px',
    borderColor: 'rgba(212,175,55,0.55)',
    color: '#d4af37',
    fontWeight: 800,
    textTransform: 'none',
    whiteSpace: 'nowrap',

    '&:hover': {
      borderColor: '#d4af37',
      backgroundColor: 'rgba(212,175,55,0.08)',
    },
  }}
>
  📷 Ler Nota
</Button>

        <TextField
  fullWidth
  placeholder="Ex.: Vendi 2 Marmitex G e 1 Coca no Pix"
  value={mensagem}
  disabled={processando}
  onChange={(event) =>
    setMensagem(event.target.value)
  }
  onKeyDown={(event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault()
      void enviar()
    }
  }}
  sx={{
    '& .MuiOutlinedInput-root': {
      height: 54,
      borderRadius: '12px',
      backgroundColor: '#f8fafc',

      '& fieldset': {
        borderColor: '#dbe3ec',
      },

      '&:hover fieldset': {
        borderColor: '#94a3b8',
      },

      '&.Mui-focused fieldset': {
        borderColor: '#d4af37',
        borderWidth: '1.5px',
      },
    },

    '& input': {
      fontSize: '0.95rem',
      color: '#0f172a',
    },

    '& input::placeholder': {
      color: '#94a3b8',
      opacity: 1,
    },
  }}
/>

<Button
  variant="contained"
  disabled={processando}
  onClick={() => void enviar()}
  sx={{
    height: 54,
    minWidth: 70,
    px: 3,
    borderRadius: '12px',

    background:
      'linear-gradient(135deg, #d4af37 0%, #e7bd45 100%)',

    color: '#0b1626',
    fontWeight: 800,
    fontSize: '0.9rem',
    textTransform: 'none',

    boxShadow:
      '0 6px 16px rgba(212,175,55,0.22)',

    '&:hover': {
      background:
        'linear-gradient(135deg, #e0b93e 0%, #f1c75b 100%)',

      boxShadow:
        '0 8px 22px rgba(212,175,55,0.30)',
    },

    '&.Mui-disabled': {
      background: '#cbd5e1',
      color: '#64748b',
    },
  }}
>
  {processando ? 'Processando...' : 'Enviar'}
</Button>
          
      </Box>
    </Paper>
  )
}