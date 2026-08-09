import {
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
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        mt: 4,
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',

        background:
          'linear-gradient(145deg, #101c2e 0%, #0b1626 100%)',

        border:
          '1px solid rgba(148,163,184,0.12)',

        boxShadow:
          '0 10px 30px rgba(0,0,0,0.18)',

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background:
            'linear-gradient(90deg, #d4af37, #f1c75b, transparent 80%)',
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 38,
            borderRadius: '10px',
            background:
              'linear-gradient(180deg, #f1c75b, #d4af37)',
          }}
        />

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: '#f8fafc',
            }}
          >
            Últimas Compras
          </Typography>

          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.82rem',
            }}
          >
            Compras mais recentes registradas
          </Typography>
        </Box>
      </Box>

      <Table
        sx={{
          '& .MuiTableCell-root': {
            borderColor:
              'rgba(148,163,184,0.10)',
          },
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              background:
                'rgba(5,14,27,0.35)',
            }}
          >
            <TableCell
              sx={{
                color: '#94a3b8',
                fontWeight: 800,
                fontSize: '0.78rem',
              }}
            >
              Fornecedor
            </TableCell>

            <TableCell
              sx={{
                color: '#94a3b8',
                fontWeight: 800,
                fontSize: '0.78rem',
              }}
            >
              Data
            </TableCell>

            <TableCell
              align="right"
              sx={{
                color: '#94a3b8',
                fontWeight: 800,
                fontSize: '0.78rem',
              }}
            >
              Total
            </TableCell>

            <TableCell
              align="center"
              sx={{
                color: '#94a3b8',
                fontWeight: 800,
                fontSize: '0.78rem',
              }}
            >
              Status
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {carregando ? (
            <TableRow>
              <TableCell
                colSpan={4}
                align="center"
                sx={{ py: 5 }}
              >
                <CircularProgress
                  size={28}
                  sx={{
                    color: '#d4af37',
                  }}
                />
              </TableCell>
            </TableRow>
          ) : compras.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                align="center"
                sx={{
                  py: 5,
                  color: '#64748b',
                }}
              >
                Nenhuma compra encontrada.
              </TableCell>
            </TableRow>
          ) : (
            compras.map((compra) => (
              <TableRow
                key={compra.id}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor:
                      'rgba(212,175,55,0.04)',
                  },
                }}
              >
                <TableCell
                  sx={{
                    color: '#e2e8f0',
                    fontWeight: 600,
                  }}
                >
                  {compra.fornecedor_nome}
                </TableCell>

                <TableCell
                  sx={{
                    color: '#94a3b8',
                  }}
                >
                  {formatarData(
                    compra.data_compra,
                  )}
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    color: '#f8fafc',
                    fontWeight: 700,
                  }}
                >
                  {formatarMoeda(
                    compra.valor_total,
                  )}
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={
                      compra.status ||
                      'pendente'
                    }
                    color={corStatus(
                      compra.status,
                    )}
                    size="small"
                    sx={{
                      fontWeight: 700,
                    }}
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