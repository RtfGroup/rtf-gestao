import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material'

import ResumoCard from '../components/dashboard/ResumoCard'
import { usePeriodoDashboard } from '../contexts/PeriodoDashboardContext'

import UltimasCompras, {
  type UltimaCompra,
} from '../components/dashboard/UltimasCompras'

import UltimasVendas, {
  type UltimaVenda,
} from '../components/dashboard/UltimasVendas'

import EstoqueBaixo, {
  type ProdutoEstoqueBaixo,
} from '../components/dashboard/EstoqueBaixo'

import GraficoFaturamento, {
  type DadoFaturamento,
} from '../components/dashboard/GraficoFaturamento'

import GraficoFluxoCaixa, {
  type DadoFluxoCaixa,
} from '../components/dashboard/GraficoFluxoCaixa'

import ResumoExecutivoCard from '../components/dashboard/ResumoExecutivoCard'
import RankingProdutos, {
  type ProdutoRanking,
} from '../components/dashboard/RankingProdutos'

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown'
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PaymentsIcon from '@mui/icons-material/Payments'
import SavingsIcon from '@mui/icons-material/Savings'
import Inventory2Icon from '@mui/icons-material/Inventory2'

import {
  gerarInsights,
  type Insight,
} from '../engine/ai/insights'

import ChatRTFAI from '../components/dashboard/ChatRTFAI'

import {
  gerarRecomendacoes,
  type Recomendacao,
} from '../engine/ai/recomendacoes'

import { supabase } from '../lib/supabase'

interface ResumoDashboard {
  vendasHoje: number
  vendasMes: number
  receber: number
  pagar: number
  recebidoMes: number
  pagoMes: number
  saldoCaixa: number
  produtosEstoque: number
}

function Dashboard() {
  const [resumo, setResumo] = useState<ResumoDashboard>({
  vendasHoje: 0,
  vendasMes: 0,
  receber: 0,
  pagar: 0,
  recebidoMes: 0,
pagoMes: 0,
  saldoCaixa: 0,
  produtosEstoque: 0,
})

  const [ultimasVendas, setUltimasVendas] =
    useState<UltimaVenda[]>([])

  const [ultimasCompras, setUltimasCompras] =
    useState<UltimaCompra[]>([])

  const [estoqueBaixo, setEstoqueBaixo] =
    useState<ProdutoEstoqueBaixo[]>([])

    const [rankingProdutos, setRankingProdutos] =
  useState<ProdutoRanking[]>([])

  const [rankingClientes, setRankingClientes] =
  useState<
    {
      nome: string
      valor: number
    }[]
  >([])

  const [ticketMedio, setTicketMedio] =
  useState(0)

const [graficoFaturamento, setGraficoFaturamento] =
  useState<DadoFaturamento[]>([])

  const [graficoFluxoCaixa, setGraficoFluxoCaixa] =
  useState<DadoFluxoCaixa[]>([])

  const [carregando, setCarregando] =
    useState(true)

  const [erro, setErro] = useState('')

  const {
  mesSelecionado,
  anoSelecionado,
} = usePeriodoDashboard()

  const [insights, setInsights] =
  useState<Insight[]>([])

const [recomendacoes, setRecomendacoes] =
  useState<Recomendacao[]>([])

useEffect(() => {
  carregarDashboard()

  const canal = supabase
    .channel('dashboard-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'vendas',
      },
      () => {
        carregarDashboard()
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'compras',
      },
      () => {
        carregarDashboard()
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'estoque',
      },
      () => {
        carregarDashboard()
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'fluxo_caixa',
      },
      () => {
        carregarDashboard()
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(canal)
  }
}, [mesSelecionado, anoSelecionado])

  async function obterEmpresaId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error('Usuário não autenticado.')
  }

  const {
    data: usuarioSistema,
    error: erroUsuario,
  } = await supabase
    .from('usuarios')
    .select('empresa_id, perfil')
    .eq('id', user.id)
    .single()

  if (erroUsuario) {
    throw erroUsuario
  }

  if (!usuarioSistema?.empresa_id) {
    throw new Error(
      'Empresa do usuário não encontrada.',
    )
  }

  if (usuarioSistema.perfil === 'admin') {
    const empresaSelecionada =
      localStorage.getItem(
        'rtf_admin_empresa_id',
      )

    const modoEmpresa =
      localStorage.getItem(
        'rtf_admin_modo_empresa',
      )

    if (
      modoEmpresa === 'true' &&
      empresaSelecionada
    ) {
      return empresaSelecionada
    }
  }

  return usuarioSistema.empresa_id
}

  async function carregarDashboard() {
    try {
      setCarregando(true)
      setErro('')

      const empresaId =
        await obterEmpresaId()

        const insightsGerados =
  await gerarInsights(empresaId)

setInsights(insightsGerados)

const recomendacoesGeradas =
  await gerarRecomendacoes(empresaId)

setRecomendacoes(recomendacoesGeradas)

      const agora = new Date()

      const inicioHoje = new Date(agora)
      inicioHoje.setHours(0, 0, 0, 0)

      const inicioAmanha =
        new Date(inicioHoje)

      inicioAmanha.setDate(
        inicioAmanha.getDate() + 1,
      )

      const inicioMes = new Date(
  anoSelecionado,
  mesSelecionado,
  1,
)

const inicioProximoMes = new Date(
  anoSelecionado,
  mesSelecionado + 1,
  1,
)
            const [
  resultadoVendasHoje,
  resultadoVendasMes,
  resultadoReceber,
  resultadoPagar,
  resultadoRecebidoMes,
  resultadoPagoMes,
  resultadoFluxo,
        resultadoEstoque,
        resultadoUltimasVendas,
        resultadoUltimasCompras,
        resultadoEstoqueBaixo,
        resultadoGrafico,
        resultadoRankingProdutos,
resultadoRankingClientes,
] = await Promise.all([
        supabase
          .from('vendas')
          .select('valor_total')
          .eq('empresa_id', empresaId)
          .gte(
            'data_venda',
            inicioHoje.toISOString(),
          )
          .lt(
            'data_venda',
            inicioAmanha.toISOString(),
          )
          .neq('status', 'cancelada'),

        supabase
          .from('vendas')
          .select('valor_total')
          .eq('empresa_id', empresaId)
          .gte(
            'data_venda',
            inicioMes.toISOString(),
          )
          .lt(
            'data_venda',
            inicioProximoMes.toISOString(),
          )
          .neq('status', 'cancelada'),
                  supabase
          .from('contas_receber')
          .select(
            'valor_original, valor_recebido, status',
          )
          .eq('empresa_id', empresaId)
          .neq('status', 'RECEBIDO'),

        supabase
          .from('contas_pagar')
          .select(
            'valor_original, valor_pago, status',
          )
          .eq('empresa_id', empresaId)
          .neq('status', 'PAGO'),

          supabase
  .from('contas_receber')
  .select('valor_recebido')
  .eq('empresa_id', empresaId)
  .gte(
    'data_recebimento',
    inicioMes.toISOString().split('T')[0],
  )
  .lt(
    'data_recebimento',
    inicioProximoMes.toISOString().split('T')[0],
  ),

supabase
  .from('contas_pagar')
  .select('valor_pago')
  .eq('empresa_id', empresaId)
  .gte(
    'data_pagamento',
    inicioMes.toISOString().split('T')[0],
  )
  .lt(
    'data_pagamento',
    inicioProximoMes.toISOString().split('T')[0],
  ),

supabase
  .from('fluxo_caixa')
  .select('*')
  .eq('empresa_id', empresaId)
  .gte(
    'data_movimento',
    inicioMes.toISOString(),
  )
  .lt(
    'data_movimento',
    inicioProximoMes.toISOString(),
  ),

        supabase
          .from('estoque')
          .select('produto_id')
          .eq('empresa_id', empresaId)
          .gt('quantidade_atual', 0),
                  supabase
  .from('vendas')
  .select(`
    id,
    data_venda,
    valor_total,
    status,
    status_pagamento,
    clientes (
      nome
    )
  `)
  .eq('empresa_id', empresaId)
  .gte(
    'data_venda',
    inicioMes.toISOString(),
  )
  .lt(
    'data_venda',
    inicioProximoMes.toISOString(),
  )
  .neq('status', 'cancelada')
  .order('data_venda', {
    ascending: false,
  })
  .limit(5),

        supabase
  .from('compras')
  .select(`
    id,
    data_compra,
    valor_total,
    status,
    fornecedores (
      razao_social,
      nome_fantasia
    )
  `)
  .eq('empresa_id', empresaId)
  .gte(
    'data_compra',
    inicioMes.toISOString().split('T')[0],
  )
  .lt(
    'data_compra',
    inicioProximoMes.toISOString().split('T')[0],
  )
  .order('data_compra', {
    ascending: false,
  })
  .limit(5),

        supabase
          .from('estoque')
          .select(`
            produto_id,
            quantidade_atual,
            produtos (
              nome,
              estoque_minimo,
              categorias (
                nome
              )
            )
          `)
          .eq('empresa_id', empresaId),

        supabase
  .from('vendas')
  .select('data_venda, valor_total')
  .eq('empresa_id', empresaId)
  .gte(
    'data_venda',
    inicioMes.toISOString(),
  )
  .lt(
    'data_venda',
    inicioProximoMes.toISOString(),
  )
  .neq('status', 'cancelada'),

supabase
  .from('itens_venda')
  .select(`
    quantidade,
    valor_unitario,
    produtos (
      nome
    ),
    vendas!inner (
      empresa_id,
      data_venda,
      status
    )
  `)
  .eq('vendas.empresa_id', empresaId)
  .gte('vendas.data_venda', inicioMes.toISOString())
  .lt('vendas.data_venda', inicioProximoMes.toISOString())
  .neq('vendas.status', 'cancelada'),

supabase
  .from('vendas')
  .select(`
    cliente_id,
    valor_total,
    clientes (
      nome
    )
  `)
  .eq('empresa_id', empresaId)
  .gte('data_venda', inicioMes.toISOString())
  .lt('data_venda', inicioProximoMes.toISOString())
  .neq('status', 'cancelada'),

      ])

      if (resultadoVendasHoje.error)
        throw resultadoVendasHoje.error

      if (resultadoVendasMes.error)
        throw resultadoVendasMes.error

      if (resultadoReceber.error)
        throw resultadoReceber.error

      if (resultadoPagar.error)
        throw resultadoPagar.error

      if (resultadoRecebidoMes.error)
  throw resultadoRecebidoMes.error

if (resultadoPagoMes.error)
  throw resultadoPagoMes.error

      if (resultadoFluxo.error)
        throw resultadoFluxo.error

      if (resultadoEstoque.error)
        throw resultadoEstoque.error

      if (resultadoUltimasVendas.error)
        throw resultadoUltimasVendas.error
            if (resultadoUltimasCompras.error)
        throw resultadoUltimasCompras.error

      if (resultadoEstoqueBaixo.error)
        throw resultadoEstoqueBaixo.error

      if (resultadoGrafico.error)
  throw resultadoGrafico.error

if (resultadoRankingProdutos.error)
  throw resultadoRankingProdutos.error

const rankingMap = new Map<
  string,
  ProdutoRanking
>()

for (const item of resultadoRankingProdutos.data ?? []) {
  const produto = Array.isArray(item.produtos)
    ? item.produtos[0]
    : item.produtos

  if (!produto?.nome) continue

  const atual = rankingMap.get(produto.nome)

  const quantidade = Number(item.quantidade ?? 0)
  const valor =
    quantidade * Number(item.valor_unitario ?? 0)

  rankingMap.set(produto.nome, {
    nome: produto.nome,
    quantidade:
      (atual?.quantidade ?? 0) + quantidade,
    valor:
      (atual?.valor ?? 0) + valor,
  })
}

const rankingReal = [...rankingMap.values()]
  .sort((a, b) => b.quantidade - a.quantidade)
  .slice(0, 5)

setRankingProdutos(rankingReal)

const mapaClientes = new Map<
  string,
  {
    nome: string
    valor: number
  }
>()

for (const venda of resultadoRankingClientes.data ?? []) {
  const cliente = Array.isArray(venda.clientes)
    ? venda.clientes[0]
    : venda.clientes

  const nome =
    cliente?.nome ?? 'Cliente não informado'

  const atual = mapaClientes.get(nome) ?? {
    nome,
    valor: 0,
  }

  atual.valor += Number(venda.valor_total ?? 0)

  mapaClientes.set(nome, atual)
}

const rankingClientesReal = Array.from(
  mapaClientes.values(),
)
  .filter((cliente) => cliente.valor > 0)
.sort((a, b) => b.valor - a.valor)
.slice(0, 5)

setRankingClientes(rankingClientesReal)

      const vendasHoje = (
        resultadoVendasHoje.data ?? []
      ).reduce(
        (total, venda) =>
          total + Number(venda.valor_total ?? 0),
        0,
      )

      const vendasMes = (
        resultadoVendasMes.data ?? []
      ).reduce(
        (total, venda) =>
          total + Number(venda.valor_total ?? 0),
        0,
      )

      const quantidadeVendasMes =
  resultadoVendasMes.data?.length ?? 0

const ticketMedioCalculado =
  quantidadeVendasMes > 0
    ? vendasMes / quantidadeVendasMes
    : 0

setTicketMedio(ticketMedioCalculado)

      const receber = (
        resultadoReceber.data ?? []
      ).reduce((total, conta) => {
        const saldo =
          Number(conta.valor_original ?? 0) -
          Number(conta.valor_recebido ?? 0)

        return total + Math.max(saldo, 0)
      }, 0)
            const pagar = (
        resultadoPagar.data ?? []
      ).reduce((total, conta) => {
        const saldo =
          Number(conta.valor_original ?? 0) -
          Number(conta.valor_pago ?? 0)

        return total + Math.max(saldo, 0)
      }, 0)

      const recebidoMes = (
  resultadoRecebidoMes.data ?? []
).reduce(
  (total, conta) =>
    total + Number(conta.valor_recebido ?? 0),
  0,
)

const pagoMes = (
  resultadoPagoMes.data ?? []
).reduce(
  (total, conta) =>
    total + Number(conta.valor_pago ?? 0),
  0,
)

      const saldoCaixa = recebidoMes - pagoMes

      const produtosEstoque =
        resultadoEstoque.data?.length ?? 0
              const vendasRecentes: UltimaVenda[] = (
        resultadoUltimasVendas.data ?? []
      ).map((venda) => {
        const relacionamento =
          venda.clientes

        const cliente = Array.isArray(
          relacionamento,
        )
          ? relacionamento[0]
          : relacionamento

        return {
          id: venda.id,
          cliente_nome:
            cliente?.nome ??
            'Consumidor final',
          data_venda: venda.data_venda,
          valor_total: Number(
            venda.valor_total ?? 0,
          ),
          status: venda.status ?? '',
          status_pagamento:
            venda.status_pagamento ??
            'pendente',
        }
      })

      const comprasRecentes: UltimaCompra[] = (
        resultadoUltimasCompras.data ?? []
      ).map((compra) => {
                const relacionamento =
          compra.fornecedores

        const fornecedor = Array.isArray(
          relacionamento,
        )
          ? relacionamento[0]
          : relacionamento

        return {
          id: compra.id,
          fornecedor_nome:
            fornecedor?.nome_fantasia ??
            fornecedor?.razao_social ??
            'Fornecedor não informado',
          data_compra:
            compra.data_compra,
          valor_total: Number(
            compra.valor_total ?? 0,
          ),
          status:
            compra.status ??
            'pendente',
        }
      })

      const produtosBaixoEstoque: ProdutoEstoqueBaixo[] =
        (
          resultadoEstoqueBaixo.data ?? []
        )
          .filter((item) => {
            const produto = Array.isArray(
              item.produtos,
            )
              ? item.produtos[0]
              : item.produtos

            return (
              Number(
                item.quantidade_atual ?? 0,
              ) <=
              Number(
                produto?.estoque_minimo ?? 0,
              )
            )
          })
          .map((item) => {
                        const produto = Array.isArray(
              item.produtos,
            )
              ? item.produtos[0]
              : item.produtos

            const categoria = Array.isArray(
              produto?.categorias,
            )
              ? produto.categorias[0]
              : produto?.categorias

            return {
              id: item.produto_id,
              nome:
                produto?.nome ??
                'Produto',
              categoria:
                categoria?.nome ??
                'Sem categoria',
              quantidade: Number(
                item.quantidade_atual ?? 0,
              ),
              minimo: Number(
                produto?.estoque_minimo ?? 0,
              ),
            }
          })

                const faturamentoPorDia = (
        resultadoGrafico.data ?? []
      ).reduce(
        (acumulador, venda) => {
          const data = new Date(
            venda.data_venda,
          ).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          })

          acumulador[data] =
            (acumulador[data] ?? 0) +
            Number(venda.valor_total ?? 0)

          return acumulador
        },
        {} as Record<string, number>,
      )

const dadosFaturamento = Object.entries(faturamentoPorDia)
  .map(([data, valor]) => {
    const [dia, mes] = data.split('/').map(Number)

    return {
      data,
      valor,
      ordem: new Date(
        new Date().getFullYear(),
        mes - 1,
        dia,
      ).getTime(),
    }
  })
  .sort((a, b) => a.ordem - b.ordem)
  .map(({ data, valor }) => ({
    data,
    valor,
  }))

setGraficoFaturamento(dadosFaturamento)

      const fluxoPorDia = (
  resultadoFluxo.data ?? []
).reduce(
  (acumulador, movimento) => {
    const dataMovimento =
      'data_movimento' in movimento
        ? movimento.data_movimento
        : null

    if (!dataMovimento) {
      return acumulador
    }

    const data = new Date(
      dataMovimento,
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })

    if (!acumulador[data]) {
      acumulador[data] = {
        entradas: 0,
        saidas: 0,
      }
    }

    const valor = Number(
      movimento.valor ?? 0,
    )

    const tipo =
      movimento.tipo?.toLowerCase()

    if (tipo === 'entrada') {
      acumulador[data].entradas += valor
    }

    if (
      tipo === 'saida' ||
      tipo === 'saída'
    ) {
      acumulador[data].saidas += valor
    }

    return acumulador
  },
  {} as Record<
    string,
    {
      entradas: number
      saidas: number
    }
  >,
)

const dadosFluxoCaixa: DadoFluxoCaixa[] =
Object.entries(
  fluxoPorDia as Record<
    string,
    {
      entradas: number
      saidas: number
    }
  >,
)
    .map(([data, valores]) => {
      const [dia, mes] = data
        .split('/')
        .map(Number)

      return {
        data,
        entradas: valores.entradas,
        saidas: valores.saidas,
        ordem: new Date(
          new Date().getFullYear(),
          mes - 1,
          dia,
        ).getTime(),
      }
    })
    .sort((a, b) => a.ordem - b.ordem)
    .map(
      ({
        data,
        entradas,
        saidas,
      }) => ({
        data,
        entradas,
        saidas,
      }),
    )

setGraficoFluxoCaixa(
  dadosFluxoCaixa,
)


      setResumo({
  vendasHoje,
  vendasMes,
  receber,
  pagar,
  recebidoMes,
pagoMes,
  saldoCaixa,
  produtosEstoque,
})

      setUltimasVendas(
        vendasRecentes,
      )

      setUltimasCompras(
        comprasRecentes,
      )

      setEstoqueBaixo(
        produtosBaixoEstoque,
      )
          } catch (error) {
      console.error(
        'Erro ao carregar dashboard:',
        error,
      )

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o dashboard.',
      )
    } finally {
      setCarregando(false)
    }
  }

  function formatarDinheiro(
    valor: number,
  ) {
    return new Intl.NumberFormat(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      },
    ).format(valor)
  }

  if (carregando) {
    return (
  <Box
    sx={{
      width: '100%',
      maxWidth: '1600px',
      mx: 'auto',
      pb: 6,
    }}
  >
    <Box
      sx={{
        mb: 3,
        p: {
          xs: 2.5,
          md: 3.5,
        },
        borderRadius: '18px',
        background:
          'linear-gradient(135deg, #07111f 0%, #0f1d33 70%, #17243a 100%)',
        border: '1px solid rgba(212,175,55,0.18)',
        boxShadow:
          '0 12px 35px rgba(15,23,42,0.10)',
        position: 'relative',
        overflow: 'hidden',

        '&::after': {
          content: '""',
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: '50%',
          right: -80,
          top: -120,
          background:
            'rgba(212,175,55,0.08)',
          pointerEvents: 'none',
        },

        '& h1, & h2, & h3, & h4, & h5, & h6': {
          color: '#ffffff',
        },

        '& p': {
          color: 'rgba(255,255,255,0.70)',
        },
      }}
    >
    </Box>
        <CircularProgress />
      </Box>
    )
  }

  return (
  <Box
    sx={{
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      minHeight: '100vh',

      m: 0,
      p: 0,

      boxSizing: 'border-box',

      color: '#f8fafc',

background:
  'linear-gradient(135deg, #07111f 0%, #0a1628 45%, #101c2e 100%)',

    }}
  >

      <Box
  sx={{
    display: 'flex',
    flexDirection: {
      xs: 'column',
      md: 'row',
    },
    alignItems: {
      xs: 'flex-start',
      md: 'center',
    },
    justifyContent: 'space-between',
    gap: 2,
    mb: 2,
    px: {
      xs: 2,
      md: 3,
    },
    py: {
      xs: 2,
      md: 2.4,
    },

    borderRadius: '16px',

    background:
      'linear-gradient(135deg, #07111f 0%, #0f1d33 70%, #17243a 100%)',

    border:
      '1px solid rgba(212,175,55,0.18)',

    boxShadow:
      '0 10px 28px rgba(0,0,0,0.20)',

    position: 'relative',
    overflow: 'hidden',

    '&::after': {
      content: '""',
      position: 'absolute',
      width: 170,
      height: 170,
      borderRadius: '50%',
      right: -65,
      top: -95,
      background:
        'rgba(212,175,55,0.07)',
      pointerEvents: 'none',
    },
  }}
>

  <Box
    sx={{
      position: 'relative',
      zIndex: 1,

      display: 'flex',
      gap: 1.25,
      flexShrink: 0,

      width: {
        xs: '100%',
        md: 'auto',
      },

      '& .MuiOutlinedInput-root': {
        height: 52,
        color: '#f8fafc',
        backgroundColor:
          'rgba(8,20,38,0.82)',
        borderRadius: '12px',

        '& fieldset': {
          borderColor:
            'rgba(148,163,184,0.18)',
        },

        '&:hover fieldset': {
          borderColor:
            'rgba(212,175,55,0.40)',
        },

        '&.Mui-focused fieldset': {
          borderColor: '#d4af37',
        },
      },

      '& .MuiInputLabel-root': {
        color: '#94a3b8',
      },

      '& .MuiSvgIcon-root': {
        color: '#d4af37',
      },
    }}
  >

  </Box>
</Box>  

{/* INDICADORES */}
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(3, minmax(0, 1fr))',
      lg: 'repeat(5, minmax(0, 1fr))',
    },
    gap: 1.25,
    mb: 2,
    width: '100%',

    '& > *': {
      minWidth: 0,
    },
  }}
>
  <ResumoCard
  titulo="Vendas Hoje"
  valor={formatarDinheiro(resumo.vendasHoje)}
  icone={<ShoppingCartIcon />}
  cor="#f5b91b"
/>

<ResumoCard
  titulo="Vendas do Mês"
  valor={formatarDinheiro(resumo.vendasMes)}
  icone={<CalendarMonthIcon />}
  cor="#f5b91b"
/>

<ResumoCard
  titulo="Ticket Médio"
  valor={formatarDinheiro(ticketMedio)}
  icone={<ConfirmationNumberIcon />}
  cor="#f5b91b"
/>

<ResumoCard
  titulo="Contas a Receber"
  valor={formatarDinheiro(resumo.receber)}
  icone={<ArrowCircleDownIcon />}
  cor="#f5b91b"
/>

<ResumoCard
  titulo="Contas a Pagar"
  valor={formatarDinheiro(resumo.pagar)}
  icone={<ArrowCircleUpIcon />}
  cor="#f5b91b"
/>

<ResumoCard
  titulo="Recebido no Mês"
  valor={formatarDinheiro(resumo.recebidoMes)}
  icone={<AccountBalanceWalletIcon />}
  cor="#22c55e"
/>

<ResumoCard
  titulo="Pago no Mês"
  valor={formatarDinheiro(resumo.pagoMes)}
  icone={<PaymentsIcon />}
  cor="#ef4444"
/>

<ResumoCard
  titulo="Saldo do Caixa"
  valor={formatarDinheiro(resumo.saldoCaixa)}
  icone={<SavingsIcon />}
  cor="#2196f3"
/>

<ResumoCard
  titulo="Produtos em Estoque"
  valor={`${resumo.produtosEstoque} ${
    resumo.produtosEstoque === 1
      ? 'Produto'
      : 'Produtos'
  }`}
  icone={<Inventory2Icon />}
  cor="#a855f7"
/>
</Box>

      {/* ÁREA DE INTELIGÊNCIA */}
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: {
      lg: 'minmax(0, 1.2fr) minmax(490px, 1fr)',
      
    },
    gap: 2,
    mb: 2,
    width: '100%',
    alignItems: 'stretch',
    '& > *': {
  minWidth: 0,
  height: '100%',
},

    '& > .MuiPaper-root': {
      mt: '0 !important',
      mb: '0 !important',
    },
  }}
>
  <ResumoExecutivoCard
    insights={insights}
    recomendacoes={recomendacoes}
  />

  <ChatRTFAI />
</Box>

{erro && (
  <Alert
    severity="error"
    sx={{ mb: 2 }}
  >
    {erro}
  </Alert>
)}

{/* GRÁFICOS */}
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 2,

    '& > .MuiPaper-root': {
      mt: '0 !important',
      height: '100%',
    },
  }}
>
  <GraficoFaturamento
    dados={graficoFaturamento}
  />

  <GraficoFluxoCaixa
    dados={graficoFluxoCaixa}
  />
</Box>

<Box sx={{ mt: 4 }}>
              <Box
  sx={{
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 2,
    mt: 2,

    '& > .MuiPaper-root': {
      mt: '0 !important',
      height: '100%',
    },
  }}
>
  <RankingProdutos
    produtos={rankingProdutos}
  />

  <Paper
    elevation={0}
    sx={{
      p: {
        xs: 2,
        md: 3,
      },
      borderRadius: '16px',
      overflow: 'hidden',
      position: 'relative',

      background:
        'linear-gradient(145deg, #101c2e 0%, #0b1626 100%)',

      border:
        '1px solid rgba(148,163,184,0.12)',

      boxShadow:
        '0 10px 30px rgba(0,0,0,0.18)',

      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '2px',
        background:
          'linear-gradient(90deg, #d4af37, #f1c75b, transparent 80%)',
      },
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: 2.5,
      }}
    >
      <Box
        sx={{
          width: 4,
          height: 38,
          borderRadius: '10px',
          background:
            'linear-gradient(180deg, #f1c75b, #d4af37)',
        }}
      />

      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-0.02em',
          }}
        >
          Clientes que mais compraram
        </Typography>

        <Typography
          sx={{
            color: '#94a3b8',
            fontSize: '0.82rem',
          }}
        >
          Ranking de clientes no período selecionado
        </Typography>
      </Box>
    </Box>

    {rankingClientes.length === 0 ? (
      <Box
        sx={{
          py: 5,
          px: 2,
          textAlign: 'center',
          borderRadius: '12px',
          border:
            '1px dashed rgba(148,163,184,0.16)',
          background:
            'rgba(5,14,27,0.22)',
        }}
      >
        <Typography
          sx={{
            color: '#64748b',
            fontSize: '0.9rem',
          }}
        >
          Nenhum cliente no período selecionado.
        </Typography>
      </Box>
    ) : (
      rankingClientes.map(
        (cliente, index) => (
          <Box
            key={`${cliente.nome}-${index}`}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              py: 1.5,
              px: 1,

              borderBottom:
                index <
                rankingClientes.length - 1
                  ? '1px solid rgba(148,163,184,0.10)'
                  : 'none',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  background:
                    'rgba(212,175,55,0.10)',

                  border:
                    '1px solid rgba(212,175,55,0.20)',
                }}
              >
                <Typography
                  sx={{
                    color: '#d4af37',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                  }}
                >
                  {index + 1}
                </Typography>
              </Box>

              <Typography
                sx={{
                  color: '#e2e8f0',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                }}
              >
                {cliente.nome}
              </Typography>
            </Box>

            <Typography
              sx={{
                color: '#f8fafc',
                fontWeight: 800,
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
              }}
            >
              {formatarDinheiro(
                cliente.valor,
              )}
            </Typography>
          </Box>
        ),
      )
    )}
  </Paper>

  <Box
    sx={{
      minWidth: 0,

      '& > .MuiPaper-root': {
        mt: '0 !important',
      },
    }}
  >
    <UltimasVendas
      vendas={ultimasVendas}
      carregando={carregando}
    />
  </Box>

  <Box
    sx={{
      minWidth: 0,

      '& > .MuiPaper-root': {
        mt: '0 !important',
      },
    }}
  >
    <UltimasCompras
      compras={ultimasCompras}
      carregando={carregando}
    />
  </Box>
</Box>

<Box
  sx={{
    mt: 2,

    '& > .MuiPaper-root': {
      mt: '0 !important',
    },
  }}
>
    <EstoqueBaixo
    produtos={estoqueBaixo}
    carregando={carregando}
  />
</Box>

</Box>

</Box>
  )
}

export default Dashboard