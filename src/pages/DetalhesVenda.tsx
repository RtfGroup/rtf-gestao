import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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
import '../styles/print.css'

interface ItemVenda {
  id: string
  produto_id: string
  quantidade: number
  valor_unitario: number
  subtotal?: number | null
  produto_nome?: string
  unidade_medida?: string
}

interface Venda {
  id: string
  cliente_id?: string | null
  data_venda?: string | null
  valor_total?: number | null
  status?: string | null
  status_pagamento?: string | null
  observacoes?: string | null
  cliente_nome?: string
}

export default function DetalhesVenda() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [venda, setVenda] = useState<Venda | null>(null)
  const [itens, setItens] = useState<ItemVenda[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    void carregarVenda()
  }, [id])

  async function carregarVenda() {
    try {
      setCarregando(true)
      setErro('')

      if (!id) {
        throw new Error('Venda não informada.')
      }

      const { data: dadosVenda, error: erroVenda } = await supabase
        .from('vendas')
        .select(`
          id,
          cliente_id,
          data_venda,
          valor_total,
          status,
          status_pagamento,
          observacoes
        `)
        .eq('id', id)
        .single()

      if (erroVenda) {
        throw erroVenda
      }

      let nomeCliente = 'Consumidor final'

      if (dadosVenda.cliente_id) {
        const { data: cliente, error: erroCliente } = await supabase
          .from('clientes')
          .select('nome')
          .eq('id', dadosVenda.cliente_id)
          .single()

        if (!erroCliente && cliente?.nome) {
          nomeCliente = cliente.nome
        }
      }

      const { data: itensVenda, error: erroItens } = await supabase
        .from('itens_venda')
        .select(`
          id,
          produto_id,
          quantidade,
          valor_unitario,
          subtotal
        `)
        .eq('venda_id', id)

      if (erroItens) {
        throw erroItens
      }

      const itensComProdutos = await Promise.all(
        (itensVenda ?? []).map(async (item) => {
          const { data: produto } = await supabase
            .from('produtos')
            .select('nome, unidade_medida')
            .eq('id', item.produto_id)
            .single()

          return {
            ...item,
            produto_nome: produto?.nome ?? 'Produto não encontrado',
            unidade_medida: produto?.unidade_medida ?? '-',
          }
        }),
      )

      setVenda({
        ...dadosVenda,
        cliente_nome: nomeCliente,
      })

      setItens(itensComProdutos)
    } catch (error) {
      console.error('Erro ao carregar venda:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar a venda.',
      )
    } finally {
      setCarregando(false)
    }
  }

  function formatarMoeda(valor?: number | null) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor ?? 0))
  }

  function formatarData(data?: string | null) {
    if (!data) {
      return '-'
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(data))
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

  if (!venda) {
    return <Alert severity="warning">Venda não encontrada.</Alert>
  }

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
            Detalhes da venda
          </Typography>

          <Typography color="text.secondary">
            {venda.cliente_nome}
          </Typography>
        </Box>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/vendas')}
        >
          Voltar
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Dados da venda
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          <Box>
            <Typography color="text.secondary">Cliente</Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {venda.cliente_nome}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">Data</Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {formatarData(venda.data_venda)}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">Status</Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {venda.status ?? '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Status do pagamento
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {venda.status_pagamento ?? '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Quantidade de itens
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {itens.length}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">Total</Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {formatarMoeda(venda.valor_total)}
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
            {itens.map((item) => {
              const subtotal =
                item.subtotal ??
                Number(item.quantidade) *
                  Number(item.valor_unitario)

              return (
                <TableRow key={item.id}>
                  <TableCell>{item.produto_nome}</TableCell>
                  <TableCell>{item.unidade_medida}</TableCell>

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

        <Box sx={{ textAlign: 'right' }}>
          <Typography color="text.secondary">
            Total da venda
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {formatarMoeda(venda.valor_total)}
          </Typography>
        </Box>
      </Paper>

      {venda.observacoes && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Observações
          </Typography>

          <Typography>{venda.observacoes}</Typography>
        </Paper>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          pb: 4,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/vendas')}
        >
          Voltar
        </Button>

        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
        >
          Imprimir venda
        </Button>
      </Box>
    </Box>
  )
}