import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
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
import DeleteIcon from '@mui/icons-material/Delete'

import { supabase } from '../lib/supabase'
import { comprasService } from '../services/compras'

interface Fornecedor {
  id: string
  nome_fantasia?: string | null
  razao_social?: string | null
}

interface Compra {
  id: string
  numero_compra?: string | null
  numero_nota?: string | null
  data_compra?: string | null
  valor_total?: number | null
  status?: string | null
  observacoes?: string | null
  fornecedores?: Fornecedor | Fornecedor[] | null
}

export default function Compras() {
  const navigate = useNavigate()

  const [compras, setCompras] = useState<Compra[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    void carregarCompras()
  }, [])

  async function obterEmpresaId() {
    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser()

    if (erroUsuario || !user) {
      throw new Error('Usuário não autenticado.')
    }

    const { data: usuario, error: erroPerfil } = await supabase
      .from('usuarios')
      .select('empresa_id')
      .eq('id', user.id)
      .single()

    if (erroPerfil) {
      throw new Error(erroPerfil.message)
    }

    if (!usuario?.empresa_id) {
      throw new Error('Usuário sem empresa vinculada.')
    }

    return usuario.empresa_id
  }

  async function carregarCompras() {
    try {
      setCarregando(true)
      setErro('')

      const empresaId = await obterEmpresaId()
      const dados = await comprasService.listarCompras(empresaId)

      setCompras((dados ?? []) as Compra[])
    } catch (error) {
      console.error('Erro ao carregar compras:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as compras.',
      )
    } finally {
      setCarregando(false)
    }
  }

  function formatarMoeda(valor?: number | null) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor ?? 0)
  }

function visualizarCompra(compra: Compra) {
  navigate(`/compras/${compra.id}`)
}

  async function excluirCompra(compra: Compra) {
    const confirmou = window.confirm(
      'Deseja realmente excluir esta compra?',
    )

    if (!confirmou) {
      return
    }

try {
  await comprasService.excluirCompra(compra.id)
  await carregarCompras()

  alert('Compra excluída com sucesso.')
}catch (error) {
      console.error('Erro ao excluir compra:', error)

      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao excluir a compra.',
      )
    }
  }

  function obterNomeFornecedor(compra: Compra) {
    const relacionamento = compra.fornecedores

    if (!relacionamento) {
      return 'Não informado'
    }

    const fornecedor = Array.isArray(relacionamento)
      ? relacionamento[0]
      : relacionamento

    if (!fornecedor) {
      return 'Não informado'
    }

    return (
      fornecedor.nome_fantasia ||
      fornecedor.razao_social ||
      'Não informado'
    )
  }

  function formatarData(data?: string | null) {
    if (!data) {
      return '-'
    }

    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'UTC',
    }).format(new Date(data))
  }

  function definirCorStatus(
    status?: string | null,
  ): 'success' | 'error' | 'warning' {
    switch (status?.toUpperCase()) {
      case 'CONFIRMADA':
        return 'success'

      case 'CANCELADA':
        return 'error'

      default:
        return 'warning'
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
            Compras
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Gerencie as compras e entradas de produtos.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/compras/nova')}
        >
          Nova compra
        </Button>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
  <TableCell>
    <strong>Nº Compra</strong>
  </TableCell>

  <TableCell>
    <strong>Fornecedor</strong>
  </TableCell>

  <TableCell>
    <strong>Nota Fiscal</strong>
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
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : compras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma compra cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              compras.map((compra) => (
                <TableRow key={compra.id} hover>
                  <TableCell>
  {compra.numero_compra ?? '-'}
</TableCell>
                  <TableCell>
                    {obterNomeFornecedor(compra)}
                  </TableCell>
                  <TableCell>
  {compra.numero_nota ?? '-'}
</TableCell>

                  <TableCell>
                    {formatarData(compra.data_compra)}
                  </TableCell>

                  <TableCell align="right">
                    {formatarMoeda(compra.valor_total)}
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={compra.status ?? 'RASCUNHO'}
                      color={definirCorStatus(compra.status)}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => visualizarCompra(compra)}
                    >
                      <VisibilityIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => void excluirCompra(compra)}
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