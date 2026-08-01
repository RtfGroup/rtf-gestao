import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  CircularProgress,
  Grid,
} from '@mui/material'

import ResumoCard from '../components/dashboard/ResumoCard'

import UltimasCompras, {
  type UltimaCompra,
} from '../components/dashboard/UltimasCompras'

import UltimasVendas, {
  type UltimaVenda,
} from '../components/dashboard/UltimasVendas'

import EstoqueBaixo, {
  type ProdutoEstoqueBaixo,
} from '../components/dashboard/EstoqueBaixo'

import CabecalhoDashboard from '../components/dashboard/CabecalhoDashboard'
import GraficoFaturamento, {
  type DadoFaturamento,
} from '../components/dashboard/GraficoFaturamento'

import ResumoExecutivoCard from '../components/dashboard/ResumoExecutivoCard'

import {
  gerarInsights,
  type Insight,
} from '../engine/ai/insights'

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
  saldoCaixa: number
  produtosEstoque: number
}

function Dashboard() {
  const [resumo, setResumo] = useState<ResumoDashboard>({
    vendasHoje: 0,
    vendasMes: 0,
    receber: 0,
    pagar: 0,
    saldoCaixa: 0,
    produtosEstoque: 0,
  })

  const [ultimasVendas, setUltimasVendas] =
    useState<UltimaVenda[]>([])

  const [ultimasCompras, setUltimasCompras] =
    useState<UltimaCompra[]>([])

  const [estoqueBaixo, setEstoqueBaixo] =
    useState<ProdutoEstoqueBaixo[]>([])

const [graficoFaturamento, setGraficoFaturamento] =
  useState<DadoFaturamento[]>([])

  const [carregando, setCarregando] =
    useState(true)

  const [erro, setErro] = useState('')

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
}, [])

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
      .select('empresa_id')
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
        agora.getFullYear(),
        agora.getMonth(),
        1,
      )

      const inicioProximoMes = new Date(
        agora.getFullYear(),
        agora.getMonth() + 1,
        1,
      )
            const [
        resultadoVendasHoje,
        resultadoVendasMes,
        resultadoReceber,
        resultadoPagar,
        resultadoFluxo,
        resultadoEstoque,
        resultadoUltimasVendas,
        resultadoUltimasCompras,
        resultadoEstoqueBaixo,
        resultadoGrafico,
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
          .from('fluxo_caixa')
          .select('tipo, valor')
          .eq('empresa_id', empresaId),

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
            new Date(
              Date.now() - 6 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          )
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

      const saldoCaixa = (
        resultadoFluxo.data ?? []
      ).reduce((total, movimento) => {
        const valor = Number(
          movimento.valor ?? 0,
        )

        const tipo =
          movimento.tipo?.toLowerCase()

        if (tipo === 'entrada') {
          return total + valor
        }

        if (
          tipo === 'saida' ||
          tipo === 'saída'
        ) {
          return total - valor
        }

        return total
      }, 0)

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

      setGraficoFaturamento(
        Object.entries(faturamentoPorDia).map(
          ([data, valor]) => ({
            data,
            valor,
          }),
        ),
      )

      setResumo({
        vendasHoje,
        vendasMes,
        receber,
        pagar,
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
      <Box>
        <CabecalhoDashboard />
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <CabecalhoDashboard />

      <ResumoExecutivoCard
        insights={insights}
        recomendacoes={recomendacoes}
      />

      {erro && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {erro}
        </Alert>
      )}

      <Grid
        container
        spacing={3}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <ResumoCard
            titulo="Vendas Hoje"
            valor={formatarDinheiro(
              resumo.vendasHoje,
            )}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <ResumoCard
            titulo="Vendas do Mês"
            valor={formatarDinheiro(
              resumo.vendasMes,
            )}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <ResumoCard
            titulo="Contas a Receber"
            valor={formatarDinheiro(
              resumo.receber,
            )}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <ResumoCard
            titulo="Contas a Pagar"
            valor={formatarDinheiro(
              resumo.pagar,
            )}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <ResumoCard
            titulo="Saldo do Caixa"
            valor={formatarDinheiro(
              resumo.saldoCaixa,
            )}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <ResumoCard
            titulo="Produtos em Estoque"
            valor={`${resumo.produtosEstoque} ${
              resumo.produtosEstoque === 1
                ? 'Produto'
                : 'Produtos'
            }`}
          />
        </Grid>
      </Grid>

      <GraficoFaturamento
        dados={graficoFaturamento}
      />

      <Box sx={{ mt: 4 }}>
        <UltimasVendas
          vendas={ultimasVendas}
          carregando={carregando}
        />
      </Box>

      <UltimasCompras
        compras={ultimasCompras}
        carregando={carregando}
      />

      <EstoqueBaixo
        produtos={estoqueBaixo}
        carregando={carregando}
      />
    </Box>
  )
}

export default Dashboard