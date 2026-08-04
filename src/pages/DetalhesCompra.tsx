import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import '../styles/print.css'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PrintIcon from '@mui/icons-material/Print'

import { supabase } from '../lib/supabase'

interface ItemCompra {
  id: string
  quantidade: number
  valor_unitario: number
  produtos:
    | {
        nome?: string | null
        unidade_medida?: string | null
      }
    | Array<{
        nome?: string | null
        unidade_medida?: string | null
      }>
    | null
}

interface Compra {
  id: string
  numero_compra?: string | null
  numero_nota?: string | null
  data_compra?: string | null
  valor_total?: number | null
  status?: string | null
  observacoes?: string | null
  fornecedores:
    | {
        razao_social?: string | null
        nome_fantasia?: string | null
        cpf_cnpj?: string | null
      }
    | Array<{
        razao_social?: string | null
        nome_fantasia?: string | null
        cpf_cnpj?: string | null
      }>
    | null
  itens_compra?: ItemCompra[] | null
}

export default function DetalhesCompra() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [compra, setCompra] = useState<Compra | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    void carregarCompra()
  }, [id])

  async function carregarCompra() {
    try {
      setCarregando(true)
      setErro('')

      if (!id) {
        throw new Error('Compra não informada.')
      }

      const { data, error } = await supabase
        .from('compras')
        .select(`
          id,
          numero_compra,
          numero_nota,
          data_compra,
          valor_total,
          status,
          observacoes,
          fornecedores (
            razao_social,
            nome_fantasia,
            cpf_cnpj
          ),
          itens_compra (
            id,
            quantidade,
            valor_unitario,
            produtos (
              nome,
              unidade_medida
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      setCompra(data as Compra)
    } catch (error) {
      console.error('Erro ao carregar compra:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar a compra.',
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

  function formatarData(data?: string | null) {
    if (!data) {
      return '-'
    }

    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'UTC',
    }).format(new Date(data))
  }

  function obterFornecedor() {
    if (!compra?.fornecedores) {
      return null
    }

    return Array.isArray(compra.fornecedores)
      ? compra.fornecedores[0]
      : compra.fornecedores
  }

  function obterProduto(item: ItemCompra) {
    if (!item.produtos) {
      return null
    }

    return Array.isArray(item.produtos)
      ? item.produtos[0]
      : item.produtos
  }

  if (carregando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (erro) {
    return <Alert severity="error">{erro}</Alert>
  }

  if (!compra) {
    return <Alert severity="warning">Compra não encontrada.</Alert>
  }

  const fornecedor = obterFornecedor()

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Detalhes da compra
          </Typography>

          <Typography color="text.secondary">
            {compra.numero_compra ?? 'Compra sem número'}
          </Typography>
        </Box>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/compras')}
        >
          Voltar
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Dados da compra
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
          }}
        >
          <Box>
            <Typography color="text.secondary">Nº da compra</Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {compra.numero_compra ?? '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">Nota fiscal</Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {compra.numero_nota ?? '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">Data</Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {formatarData(compra.data_compra)}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">Fornecedor</Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {fornecedor?.nome_fantasia ||
                fornecedor?.razao_social ||
                '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">CNPJ/CPF</Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {fornecedor?.cpf_cnpj ?? '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">Status</Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {compra.status ?? 'RASCUNHO'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Produtos
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Produto</strong>
              </TableCell>

              <TableCell>
                <strong>Unidade</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Quantidade</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Valor unitário</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Subtotal</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {(compra.itens_compra ?? []).map((item) => {
              const produto = obterProduto(item)
              const subtotal =
                Number(item.quantidade) *
                Number(item.valor_unitario)

              return (
                <TableRow key={item.id}>
                  <TableCell>{produto?.nome ?? '-'}</TableCell>

                  <TableCell>
                    {produto?.unidade_medida ?? '-'}
                  </TableCell>

                  <TableCell align="right">
                    {item.quantidade}
                  </TableCell>

                  <TableCell align="right">
                    {formatarMoeda(item.valor_unitario)}
                  </TableCell>

                  <TableCell align="right">
                    {formatarMoeda(subtotal)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <Divider sx={{ my: 3 }} />

<Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 3,
    flexWrap: 'wrap',
  }}
>
  <Box>
    <Typography color="text.secondary">
      Quantidade de itens
    </Typography>

    <Typography sx={{ fontWeight: 600 }}>
      {compra.itens_compra?.length ?? 0}
    </Typography>
  </Box>

  <Box sx={{ textAlign: 'right' }}>
    <Typography color="text.secondary">
      Total da compra
    </Typography>

    <Typography variant="h4" sx={{ fontWeight: 700 }}>
      {formatarMoeda(compra.valor_total)}
    </Typography>
  </Box>
</Box>
      </Paper>

      {compra.observacoes && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Observações
          </Typography>

          <Typography>{compra.observacoes}</Typography>
        </Paper>
          )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          mt: 3,
          pb: 4,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/compras')}
        >
          Voltar
        </Button>

        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
        >
          Imprimir compra
        </Button>
      </Box>
    </Box>
  )
}