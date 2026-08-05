import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
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

import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'

import { supabase } from '../lib/supabase'
import vendasService from '../services/vendas/vendas.service'

interface Venda {
  id: string
  cliente_id: string | null
  data_venda: string
  valor_total: number
  status: string
  status_pagamento?: string | null
  clientes?: {
    nome: string
  } | null
}

export default function Vendas() {
  const navigate = useNavigate()

  const [vendas, setVendas] = useState<Venda[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarVendas()
  }, [])

  async function carregarVendas() {
    try {
      setCarregando(true)
      setErro('')

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser()

      if (erroUsuario) {
        throw erroUsuario
      }

      if (!user) {
        throw new Error('Usuário não autenticado.')
      }

      const { data: usuarioSistema, error: erroUsuarioSistema } =
        await supabase
          .from('usuarios')
          .select('empresa_id')
          .eq('id', user.id)
          .single()

      if (erroUsuarioSistema) {
        throw erroUsuarioSistema
      }

      if (!usuarioSistema?.empresa_id) {
        throw new Error('Empresa do usuário não encontrada.')
      }

      const resultado = await vendasService.listarVendas(
        usuarioSistema.empresa_id
      )

      setVendas(resultado as Venda[])
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as vendas.'
      )
    } finally {
      setCarregando(false)
    }
  }

  function formatarData(data: string) {
    if (!data) return '-'

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(data))
  }

  function formatarValor(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor ?? 0))
  }

  function obterCorStatus(
    status: string
  ): 'success' | 'warning' | 'error' | 'default' {
    const statusNormalizado = status?.toLowerCase()

    if (
      statusNormalizado === 'finalizada' ||
      statusNormalizado === 'pago' ||
      statusNormalizado === 'concluida'
    ) {
      return 'success'
    }
    if (
      statusNormalizado === 'pendente' ||
      statusNormalizado === 'aberta'
    ) {
      return 'warning'
    }

    if (
      statusNormalizado === 'cancelada' ||
      statusNormalizado === 'cancelado'
    ) {
      return 'error'
    }

    return 'default'
  }

      function visualizarVenda(venda: Venda) {
  navigate(`/vendas/${venda.id}`)
}

function editarVenda(venda: Venda) {
  navigate(`/vendas/${venda.id}/editar`)
}
async function excluirVenda(venda: Venda) {
  const confirmou = window.confirm(
    'Deseja realmente excluir esta venda?',
  )

  if (!confirmou) {
    return
  }

  try {
    const { error: erroItens } = await supabase
      .from('itens_venda')
      .delete()
      .eq('venda_id', venda.id)

    if (erroItens) {
      throw erroItens
    }

    const { error: erroVenda } = await supabase
      .from('vendas')
      .delete()
      .eq('id', venda.id)

    if (erroVenda) {
      throw erroVenda
    }

    await carregarVendas()
  } catch (error) {
    console.error(JSON.stringify(error, null, 2))

    setErro(
      error instanceof Error
        ? error.message
        : 'Não foi possível excluir a venda.',
    )
  }
}

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Vendas
          </Typography>

          <Typography color="text.secondary">
            Gerencie as vendas e saídas de produtos.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vendas/nova')}
        >
          Nova venda
        </Button>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erro}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Cliente</strong>
              </TableCell>

              <TableCell>
                <strong>Data</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Total</strong>
              </TableCell>

              <TableCell align="center">
                <strong>Status</strong>
              </TableCell>

              <TableCell align="center">
  <strong>Ações</strong>
</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : vendas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhuma venda cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              vendas.map((venda) => (
                <TableRow key={venda.id} hover>
                  <TableCell>
                    {venda.clientes?.nome ?? 'Consumidor final'}
                  </TableCell>

                  <TableCell>{formatarData(venda.data_venda)}</TableCell>

                  <TableCell align="right">
                    {formatarValor(venda.valor_total)}
                  </TableCell>

                  <TableCell align="center">
<Chip
  label={venda.status ?? 'Sem status'}
  color={obterCorStatus(venda.status)}
  size="small"
/>
                  </TableCell>
                  <TableCell align="center">
  <IconButton
    color="primary"
    onClick={() => visualizarVenda(venda)}
  >
    <VisibilityIcon />
  </IconButton>

  <IconButton
    color="warning"
    onClick={() => editarVenda(venda)}
  >
    <EditIcon />
  </IconButton>

<IconButton
  color="error"
  onClick={() => void excluirVenda(venda)}
>
  <DeleteIcon />
</IconButton>
</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}