import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface EmpresaRTF {
  id: string
  nome_fantasia?: string | null
  razao_social?: string | null
  ativo?: boolean | null
  plano?: string | null
  status_sistema?: string | null
}

export default function ClientesRTF() {
  const navigate = useNavigate()

  const [empresas, setEmpresas] =
    useState<EmpresaRTF[]>([])

  const [carregando, setCarregando] =
    useState(true)

  const [erro, setErro] =
    useState('')

  useEffect(() => {
    void carregarEmpresas()
  }, [])

  async function carregarEmpresas() {
    try {
      setCarregando(true)
      setErro('')

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
        .order('nome_fantasia')

      if (error) {
        throw error
      }

      setEmpresas(data ?? [])
    } catch (error) {
      console.error(
        'Erro ao carregar Clientes RTF:',
        error,
      )

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os clientes RTF.',
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
          }}
        >
          Clientes RTF
        </Typography>

        <Typography color="text.secondary">
          Empresas atendidas pela RTF Gestão.
        </Typography>
      </Box>

      {erro && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {erro}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Empresa</strong>
              </TableCell>

              <TableCell>
                <strong>Plano</strong>
              </TableCell>

              <TableCell>
                <strong>Status</strong>
              </TableCell>

              <TableCell>
                <strong>Sistema</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                >
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : empresas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                >
                  Nenhuma empresa cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              empresas.map((empresa) => {
                const nome =
                  empresa.nome_fantasia ??
                  empresa.razao_social ??
                  'Empresa sem nome'

                return (
                  <TableRow
                    key={empresa.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      navigate(
                        `/admin/clientes-rtf/${empresa.id}`,
                      )
                    }
                  >
                    <TableCell>
                      <strong>{nome}</strong>
                    </TableCell>

                    <TableCell>
                      {empresa.plano ??
                        'Não informado'}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          empresa.ativo === false
                            ? 'Inativo'
                            : 'Ativo'
                        }
                        color={
                          empresa.ativo === false
                            ? 'default'
                            : 'success'
                        }
                      />
                    </TableCell>

                    <TableCell>
                      {empresa.status_sistema ??
                        'Normal'}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}