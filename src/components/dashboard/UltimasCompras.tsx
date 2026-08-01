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

export interface UltimaCompra {
  id: string
  fornecedor_nome: string
  data_compra: string
  valor_total: number
  status: string
}

interface Props {
  compras: UltimaCompra[]
  carregando: boolean
}

function formatarMoeda(valor?: number | null) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor ?? 0))
}

function formatarData(data?: string | null) {
  if (!data) return '-'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(data))
}

function corStatus(
  status?: string,
): 'success' | 'warning' | 'error' | 'default' {
  switch (status?.toLowerCase()) {
    case 'finalizada':
    case 'recebida':
      return 'success'

    case 'aberta':
    case 'pendente':
      return 'warning'

    case 'cancelada':
      return 'error'

    default:
      return 'default'
  }
}

export default function UltimasCompras({
  compras,
  carregando,
}: Props) {
  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography
        variant="h6"
        sx={{ px: 2, pt: 2, pb: 1, fontWeight: 700 }}
      >
        Últimas Compras
      </Typography>

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
                <CircularProgress size={28} />
              </TableCell>
            </TableRow>
          ) : compras.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                Nenhuma compra encontrada.
              </TableCell>
            </TableRow>
          ) : (
            compras.map((compra) => (
              <TableRow key={compra.id} hover>
                <TableCell>{compra.fornecedor_nome}</TableCell>

                <TableCell>
                  {formatarData(compra.data_compra)}
                </TableCell>

                <TableCell align="right">
                  {formatarMoeda(compra.valor_total)}
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={compra.status}
                    color={corStatus(compra.status)}
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