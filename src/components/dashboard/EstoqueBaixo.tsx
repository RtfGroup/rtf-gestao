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

export interface ProdutoEstoqueBaixo {
  id: string
  nome: string
  categoria: string
  quantidade: number
  minimo: number
}

interface Props {
  produtos: ProdutoEstoqueBaixo[]
  carregando: boolean
}

export default function EstoqueBaixo({
  produtos,
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
            Produtos com Estoque Baixo
          </Typography>

          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.82rem',
            }}
          >
            Produtos que precisam de reposição
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
              Produto
            </TableCell>

            <TableCell
              sx={{
                color: '#94a3b8',
                fontWeight: 800,
                fontSize: '0.78rem',
              }}
            >
              Categoria
            </TableCell>

            <TableCell
              align="center"
              sx={{
                color: '#94a3b8',
                fontWeight: 800,
                fontSize: '0.78rem',
              }}
            >
              Atual
            </TableCell>

            <TableCell
              align="center"
              sx={{
                color: '#94a3b8',
                fontWeight: 800,
                fontSize: '0.78rem',
              }}
            >
              Mínimo
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
                colSpan={5}
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
          ) : produtos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
                sx={{
                  py: 5,
                  color: '#64748b',
                }}
              >
                Nenhum produto com estoque baixo.
              </TableCell>
            </TableRow>
          ) : (
            produtos.map((produto) => (
              <TableRow
                key={produto.id}
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
                  {produto.nome}
                </TableCell>

                <TableCell
                  sx={{
                    color: '#94a3b8',
                  }}
                >
                  {produto.categoria}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color:
                      produto.quantidade <=
                      produto.minimo
                        ? '#f59e0b'
                        : '#e2e8f0',
                    fontWeight: 800,
                  }}
                >
                  {produto.quantidade}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color: '#cbd5e1',
                    fontWeight: 600,
                  }}
                >
                  {produto.minimo}
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label="Baixo"
                    color="warning"
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