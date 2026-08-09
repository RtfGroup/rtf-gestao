import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material'

import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface EmpresaDetalhe {
  id: string
  nome_fantasia?: string | null
  razao_social?: string | null
  ativo?: boolean | null
  plano?: string | null
  status_sistema?: string | null
}

export default function ClienteRTFDetalhes() {
  const { empresaId } = useParams()
  const navigate = useNavigate()

  const [empresa, setEmpresa] =
    useState<EmpresaDetalhe | null>(null)

  const [carregando, setCarregando] =
    useState(true)

  const [erro, setErro] =
    useState('')

  useEffect(() => {
    void carregarEmpresa()
  }, [empresaId])

  async function carregarEmpresa() {
    try {
      setCarregando(true)
      setErro('')

      if (!empresaId) {
        throw new Error(
          'Empresa não informada.',
        )
      }

      const {
        data: { user },
        error: erroAuth,
      } = await supabase.auth.getUser()

      if (erroAuth) {
        throw erroAuth
      }

      if (!user) {
        throw new Error(
          'Usuário não autenticado.',
        )
      }

      const {
        data: usuario,
        error: erroUsuario,
      } = await supabase
        .from('usuarios')
        .select('perfil')
        .eq('id', user.id)
        .single()

      if (erroUsuario) {
        throw erroUsuario
      }

      if (usuario?.perfil !== 'admin') {
        throw new Error(
          'Acesso permitido somente para administradores.',
        )
      }

      const {
        data,
        error,
      } = await supabase
        .from('empresas')
        .select(`
          id,
          nome_fantasia,
          razao_social,
          ativo,
          plano,
          status_sistema
        `)
        .eq('id', empresaId)
        .single()

      if (error) {
        throw error
      }

      setEmpresa(data)
    } catch (error) {
      console.error(
        'Erro ao carregar empresa:',
        error,
      )

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar a empresa.',
      )
    } finally {
      setCarregando(false)
    }
  }

  function acessarEmpresa() {
    if (!empresaId) return

    localStorage.setItem(
      'rtf_admin_empresa_id',
      empresaId,
    )

    localStorage.setItem(
      'rtf_admin_modo_empresa',
      'true',
    )

    navigate('/dashboard')
  }

  if (carregando) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (erro) {
    return (
      <Alert severity="error">
        {erro}
      </Alert>
    )
  }

  if (!empresa) {
    return null
  }

  const nomeEmpresa =
    empresa.nome_fantasia ??
    empresa.razao_social ??
    'Empresa'

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 1,
        }}
      >
        {nomeEmpresa}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Painel administrativo do cliente RTF.
      </Typography>

      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
        }}
      >
        <Typography sx={{ mb: 1 }}>
          <strong>Status:</strong>{' '}
          {empresa.ativo === false
            ? 'Inativo'
            : 'Ativo'}
        </Typography>

        <Typography sx={{ mb: 1 }}>
          <strong>Plano:</strong>{' '}
          {empresa.plano ?? 'Não informado'}
        </Typography>

        <Typography sx={{ mb: 3 }}>
          <strong>Status do sistema:</strong>{' '}
          {empresa.status_sistema ??
            'Não informado'}
        </Typography>

        <Button
          variant="contained"
          onClick={acessarEmpresa}
        >
          Acessar empresa
        </Button>
      </Paper>
    </Box>
  )
}