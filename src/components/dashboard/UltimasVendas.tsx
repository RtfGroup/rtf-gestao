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
            Últimas Vendas
          </Typography>

          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.82rem',
            }}
          >
            Movimentações de vendas mais recentes
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
              Cliente
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
              Pagamento
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {carregando ? (
            <TableRow>
              <TableCell
                colSpan={4}
                align="center"
                sx={{
                  py: 5,
                  color: '#94a3b8',
                }}
              >
                <CircularProgress
                  size={28}
                  sx={{
                    color: '#d4af37',
                  }}
                />
              </TableCell>
            </TableRow>
          ) : vendas.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                align="center"
                sx={{
                  py: 5,
                  color: '#64748b',
                }}
              >
                Nenhuma venda encontrada.
              </TableCell>
            </TableRow>
          ) : (
            vendas.map((venda) => (
              <TableRow
                key={venda.id}
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
                  {venda.cliente_nome ||
                    'Consumidor final'}
                </TableCell>

                <TableCell
                  sx={{
                    color: '#94a3b8',
                  }}
                >
                  {formatarData(
                    venda.data_venda,
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
                    venda.valor_total,
                  )}
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={
                      venda.status_pagamento ||
                      'pendente'
                    }
                    color={definirCorPagamento(
                      venda.status_pagamento,
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