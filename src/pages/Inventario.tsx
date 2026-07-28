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

import { listarEstoque } from '../services/estoque'
import type { ItemEstoque } from '../services/estoque'

function Inventario() {
  const [estoque, setEstoque] = useState<ItemEstoque[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true)
        setErro('')

        const dados = await listarEstoque()

        setEstoque(dados)
      } catch (error) {
        console.error('Erro ao carregar estoque:', error)

        setErro(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o estoque.',
        )
      } finally {
        setCarregando(false)
      }
    }

    carregar()
  }, [])

function nomeProduto(item: ItemEstoque) {
  if (!item.produtos) {
    return 'Produto não encontrado'
  }

  if (Array.isArray(item.produtos)) {
    return item.produtos[0]?.nome ?? 'Produto não encontrado'
  }

  return item.produtos.nome
}

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor ?? 0)
  }

  function formatarQuantidade(valor: number) {
    return Number(valor ?? 0).toLocaleString('pt-BR')
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Inventário
        </Typography>

        <Typography color="text.secondary">
          Acompanhe o estoque atual dos produtos.
        </Typography>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      {carregando ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Produto</strong>
                </TableCell>

                <TableCell align="center">
                  <strong>Saldo</strong>
                </TableCell>

                <TableCell align="right">
                  <strong>Custo médio</strong>
                </TableCell>

                <TableCell align="right">
                  <strong>Valor em estoque</strong>
                </TableCell>

                <TableCell align="center">
                  <strong>Estoque mínimo</strong>
                </TableCell>

                <TableCell align="center">
                  <strong>Status</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {estoque.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhum produto no estoque.
                  </TableCell>
                </TableRow>
              ) : (
                estoque.map((item) => {
                  const quantidade = Number(item.quantidade_atual ?? 0)
                  const custo = Number(item.custo_medio ?? 0)
                  const minimo = Number(item.estoque_minimo ?? 0)

                  const valorEstoque = quantidade * custo

                  const estoqueBaixo =
                    minimo > 0 && quantidade <= minimo

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        {nomeProduto(item)}
                      </TableCell>

                      <TableCell align="center">
                        {formatarQuantidade(quantidade)}
                      </TableCell>

                      <TableCell align="right">
                        {formatarMoeda(custo)}
                      </TableCell>

                      <TableCell align="right">
                        {formatarMoeda(valorEstoque)}
                      </TableCell>

                      <TableCell align="center">
                        {formatarQuantidade(minimo)}
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={
                            estoqueBaixo
                              ? 'ESTOQUE BAIXO'
                              : 'NORMAL'
                          }
                          color={
                            estoqueBaixo
                              ? 'warning'
                              : 'success'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default Inventario