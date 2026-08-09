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

import { supabase } from '../lib/supabase'

interface MovimentoEstoque {
  id: string
  produto_id: string | null
  tipo: string | null
  quantidade: number | null
  observacao: string | null
  created_at: string | null
  origem: string | null
  custo_unitario: number | null
  saldo_anterior: number | null
  saldo_posterior: number | null
  produto_nome?: string
}

export default function Estoque() {
  const [movimentacoes, setMovimentacoes] =
    useState<MovimentoEstoque[]>([])

  const [carregando, setCarregando] =
    useState(true)

  const [erro, setErro] =
    useState('')

  useEffect(() => {
    void carregarMovimentacoes()
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
      data: usuario,
      error: erroUsuario,
    } = await supabase
      .from('usuarios')
      .select('empresa_id, perfil')
      .eq('id', user.id)
      .single()

    if (erroUsuario) {
      throw erroUsuario
    }

    if (!usuario?.empresa_id) {
      throw new Error(
        'Empresa do usuário não encontrada.',
      )
    }

    if (usuario.perfil === 'admin') {
      const modoEmpresa =
        localStorage.getItem(
          'rtf_admin_modo_empresa',
        )

      const empresaSelecionada =
        localStorage.getItem(
          'rtf_admin_empresa_id',
        )

      if (
        modoEmpresa === 'true' &&
        empresaSelecionada
      ) {
        return empresaSelecionada
      }
    }

    return usuario.empresa_id
  }

  async function carregarMovimentacoes() {
    try {
      setCarregando(true)
      setErro('')

      const empresaId =
        await obterEmpresaId()

      const {
        data,
        error,
      } = await supabase
        .from('movimentacoes_estoque')
        .select(`
          id,
          produto_id,
          tipo,
          quantidade,
          observacao,
          created_at,
          origem,
          custo_unitario,
          saldo_anterior,
          saldo_posterior,
          produtos (
            nome
          )
        `)
        .eq('empresa_id', empresaId)
        .order('created_at', {
          ascending: false,
        })

      if (error) {
        throw error
      }

      const movimentos =
        (data ?? []).map((item) => {
          const produto = Array.isArray(
            item.produtos,
          )
            ? item.produtos[0]
            : item.produtos

          return {
            id: item.id,
            produto_id: item.produto_id,
            tipo: item.tipo,
            quantidade: Number(
              item.quantidade ?? 0,
            ),
            observacao: item.observacao,
            created_at: item.created_at,
            origem: item.origem,
            custo_unitario: Number(
              item.custo_unitario ?? 0,
            ),
            saldo_anterior: Number(
              item.saldo_anterior ?? 0,
            ),
            saldo_posterior: Number(
              item.saldo_posterior ?? 0,
            ),
            produto_nome:
              produto?.nome ??
              'Produto não informado',
          }
        })

      setMovimentacoes(movimentos)
    } catch (error) {
      console.error(
        'Erro ao carregar movimentações:',
        error,
      )

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as movimentações.',
      )
    } finally {
      setCarregando(false)
    }
  }

  function formatarData(
    data: string | null,
  ) {
    if (!data) {
      return '-'
    }

    return new Date(data).toLocaleString(
      'pt-BR',
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700 }}
        >
          Movimentações de Estoque
        </Typography>

        <Typography color="text.secondary">
          Histórico de entradas e saídas dos produtos.
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
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Produto</strong>
              </TableCell>

              <TableCell>
                <strong>Tipo</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Quantidade</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Anterior</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Posterior</strong>
              </TableCell>

              <TableCell>
                <strong>Origem</strong>
              </TableCell>

              <TableCell>
                <strong>Data</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                >
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : movimentacoes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                >
                  Nenhuma movimentação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              movimentacoes.map(
                (movimento) => (
                  <TableRow
                    key={movimento.id}
                    hover
                  >
                    <TableCell>
                      {movimento.produto_nome}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          movimento.tipo ??
                          'Não informado'
                        }
                        color={
                          movimento.tipo
                            ?.toLowerCase()
                            .includes('entrada')
                            ? 'success'
                            : movimento.tipo
                                ?.toLowerCase()
                                .includes('saida') ||
                              movimento.tipo
                                ?.toLowerCase()
                                .includes('saída')
                            ? 'error'
                            : 'default'
                        }
                      />
                    </TableCell>

                    <TableCell align="right">
                      {movimento.quantidade ?? 0}
                    </TableCell>

                    <TableCell align="right">
                      {movimento.saldo_anterior ??
                        0}
                    </TableCell>

                    <TableCell align="right">
                      {movimento.saldo_posterior ??
                        0}
                    </TableCell>

                    <TableCell>
                      {movimento.origem ?? '-'}
                    </TableCell>

                    <TableCell>
                      {formatarData(
                        movimento.created_at,
                      )}
                    </TableCell>
                  </TableRow>
                ),
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}