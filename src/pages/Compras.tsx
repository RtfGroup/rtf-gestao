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

import { comprasService } from '../services/compras'

interface Fornecedor {
  id: string
  nome: string
}

interface Compra {
  id: string
  numero_compra?: string | null
  numero_nota?: string | null
  data_compra?: string | null
  valor_total?: number | null
  status?: string | null
  observacoes?: string | null
  fornecedores?: Fornecedor[] | null
}

export default function Compras() {
  const navigate = useNavigate()

  const [compras, setCompras] = useState<Compra[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarCompras()
  }, [])

  async function carregarCompras() {
    try {
      setCarregando(true)
      setErro('')

      const empresaId = localStorage.getItem('empresa_id')

      if (!empresaId) {
        setCompras([])
        setErro('O ID da empresa ainda não está configurado no sistema.')
        return
      }

      const dados = await comprasService.listarCompras(empresaId)

      setCompras((dados ?? []) as Compra[])
    } catch (error) {
      console.error(error)
      setErro('Não foi possível carregar as compras.')
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
        <Alert severity="warning" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Fornecedor</strong>
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
            </TableRow>
          </TableHead>

          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : compras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhuma compra cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              compras.map((compra) => (
                <TableRow key={compra.id} hover>
                  <TableCell>
                    {compra.fornecedores?.[0]?.nome ?? 'Não informado'}
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}