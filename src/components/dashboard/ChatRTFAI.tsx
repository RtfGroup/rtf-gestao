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

    setCompraPendente(null)

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
  setResposta('📊 Consultando estoque...')

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

  setRecebimentoPendente({
    contaId: conta.id,
    cliente: recebimento.cliente,
    valor: recebimento.valor,
    formaPagamento: recebimento.formaPagamento,
  })

  setResposta(
    [
      '💵 Recebimento identificado.',
      '',
      `Cliente: ${recebimento.cliente}`,
      `Valor: ${formatarMoeda(recebimento.valor)}`,
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

setRecebimentoPendente({
  contaId: conta.id,
  cliente: recebimento.cliente,
  valor: recebimento.valor,
  formaPagamento: recebimento.formaPagamento,
})

setResposta(
    [
      '💵 Recebimento identificado.',
      '',
      `Cliente: ${recebimento.cliente}`,
      `Valor: ${formatarMoeda(recebimento.valor)}`,
      `Forma de pagamento: ${recebimento.formaPagamento}`,
      recebimento.referencia
        ? `Referência: ${recebimento.referencia}`
        : '',
      '',
      'Na próxima etapa vamos localizar a conta e registrar a baixa.',
    ]
      .filter(Boolean)
      .join('\n'),
  )
    } else if (tipoComando === 'PAGAMENTO') {
  const pagamento = interpretarPagamentoIA(texto)

const conta = await localizarContaPagar(
  empresaId,
  pagamento.fornecedor,
)

if (!conta) {
  setResposta(
`❌ Nenhuma conta em aberto encontrada para ${pagamento.fornecedor}.`,
  )

  setMensagem('')
  return
}

setPagamentoPendente({
  contaId: conta.id,
  fornecedor: pagamento.fornecedor,
  valor: pagamento.valor,
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
    `Valor: ${formatarMoeda(pagamento.valor)}`,
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
}else {
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
      gera_contas_pagar: true,
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
    <Paper sx={{ p: 3, mt: 4 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700 }}
      >
        RTF AI
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 2 }}
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
          p: 2,
          height: 280,
          mb: 2,
          overflow: 'auto',
        }}
      >
        <Typography
          sx={{
            whiteSpace: 'pre-line',
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
        />

        <Button
          variant="contained"
          disabled={processando}
          onClick={() => void enviar()}
        >
          Enviar
        </Button>
      </Box>
    </Paper>
  )
}