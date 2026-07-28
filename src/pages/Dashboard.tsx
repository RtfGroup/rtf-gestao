import { useEffect, useState } from 'react'
import {
  Alert,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material'

import ResumoCard from '../components/dashboard/ResumoCard'
import { supabase } from '../lib/supabase'

interface ResumoDashboard {
  vendasHoje: number
  receber: number
  pagar: number
  produtosEstoque: number
}

function Dashboard() {
  const [resumo, setResumo] = useState<ResumoDashboard>({
    vendasHoje: 0,
    receber: 0,
    pagar: 0,
    produtosEstoque: 0,
  })

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarDashboard()
  }, [])

  async function carregarDashboard() {
    try {
      setCarregando(true)
      setErro('')

      const {
        data: { user },
        error: erroAutenticacao,
      } = await supabase.auth.getUser()

      if (erroAutenticacao) {
        throw erroAutenticacao
      }

      if (!user) {
        throw new Error('Usuário não autenticado.')
      }

      const { data: usuarioSistema, error: erroUsuario } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

      if (erroUsuario) {
        throw erroUsuario
      }

      if (!usuarioSistema?.empresa_id) {
        throw new Error('Empresa do usuário não encontrada.')
      }

      const empresaId = usuarioSistema.empresa_id

      const inicioHoje = new Date()
      inicioHoje.setHours(0, 0, 0, 0)

      const inicioAmanha = new Date(inicioHoje)
      inicioAmanha.setDate(inicioAmanha.getDate() + 1)

      const [
        resultadoVendas,
        resultadoEstoque,
      ] = await Promise.all([
        supabase
          .from('vendas')
          .select('valor_total')
          .eq('empresa_id', empresaId)
          .gte('data_venda', inicioHoje.toISOString())
          .lt('data_venda', inicioAmanha.toISOString())
          .neq('status', 'cancelada'),

        supabase
          .from('estoque')
          .select('produto_id')
          .eq('empresa_id', empresaId)
          .gt('quantidade_atual', 0),
      ])

      if (resultadoVendas.error) {
        throw resultadoVendas.error
      }

      if (resultadoEstoque.error) {
        throw resultadoEstoque.error
      }

      const vendasHoje = (resultadoVendas.data ?? []).reduce(
        (total, venda) => total + Number(venda.valor_total ?? 0),
        0
      )

      const produtosEstoque = resultadoEstoque.data?.length ?? 0

      setResumo({
        vendasHoje,
        receber: 0,
        pagar: 0,
        produtosEstoque,
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o dashboard.'
      )
    } finally {
      setCarregando(false)
    }
  }

  function formatarDinheiro(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  if (carregando) {
    return (
      <>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Dashboard
        </Typography>

        <CircularProgress />
      </>
    )
  }

  return (
    <>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ResumoCard
            titulo="Vendas Hoje"
            valor={formatarDinheiro(resumo.vendasHoje)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ResumoCard
            titulo="Receber"
            valor={formatarDinheiro(resumo.receber)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ResumoCard
            titulo="Pagar"
            valor={formatarDinheiro(resumo.pagar)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ResumoCard
            titulo="Estoque"
            valor={`${resumo.produtosEstoque} ${
              resumo.produtosEstoque === 1 ? 'Produto' : 'Produtos'
            }`}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default Dashboard