import {
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

export interface UltimaVenda {
  id: string
  cliente_nome: string
  data_venda: string
  valor_total: number
  status: string
  status_pagamento: string
}

interface Props {
  vendas: UltimaVenda[]
  carregando: boolean
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

function definirCorPagamento(
  status?: string | null,
): 'success' | 'warning' | 'error' | 'default' {
  switch (status?.toLowerCase()) {
    case 'pago':
      return 'success'

    case 'pendente':
      return 'warning'

    case 'cancelado':
      return 'error'

    default:
      return 'default'
  }
}

export default function UltimasVendas({
  vendas,
  carregando,
}: Props) {
  return (
    <TableContainer component={Paper}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          px: 2,
          pt: 2,
          pb: 1,
        }}
      >
        Últimas Vendas
      </Typography>

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
              <strong>Pagamento</strong>
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
          ) : vendas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                Nenhuma venda encontrada.
              </TableCell>
            </TableRow>
          ) : (
            vendas.map((venda) => (
              <TableRow key={venda.id} hover>
                <TableCell>
                  {venda.cliente_nome || 'Consumidor final'}
                </TableCell>

                <TableCell>
                  {formatarData(venda.data_venda)}
                </TableCell>

                <TableCell align="right">
                  {formatarMoeda(venda.valor_total)}
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={venda.status_pagamento || 'pendente'}
                    color={definirCorPagamento(
                      venda.status_pagamento,
                    )}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}