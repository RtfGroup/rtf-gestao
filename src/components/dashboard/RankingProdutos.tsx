import {
  Box,
  Paper,
  Typography,
} from '@mui/material'

export interface ProdutoRanking {
  nome: string
  quantidade: number
  valor: number
}

interface Props {
  produtos: ProdutoRanking[]
}

export default function RankingProdutos({
  produtos,
}: Props) {
  const formatarDinheiro = (
    valor: number,
  ) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)

  return (
    <Paper
      elevation={0}
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
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
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 2.5,
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
            Produtos mais vendidos
          </Typography>

          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.82rem',
            }}
          >
            Ranking do período selecionado
          </Typography>
        </Box>
      </Box>

      {produtos.length === 0 ? (
        <Box
          sx={{
            py: 5,
            px: 2,
            textAlign: 'center',
            borderRadius: '12px',

            border:
              '1px dashed rgba(148,163,184,0.16)',

            background:
              'rgba(5,14,27,0.22)',
          }}
        >
          <Typography
            sx={{
              color: '#64748b',
              fontSize: '0.9rem',
            }}
          >
            Nenhum produto vendido no período selecionado.
          </Typography>
        </Box>
      ) : (
        produtos.map(
          (produto, index) => (
            <Box
              key={`${produto.nome}-${index}`}
              sx={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                px: 1,

                borderBottom:
                  index <
                  produtos.length - 1
                    ? '1px solid rgba(148,163,184,0.10)'
                    : 'none',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    background:
                      'rgba(212,175,55,0.10)',

                    border:
                      '1px solid rgba(212,175,55,0.20)',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#d4af37',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                    }}
                  >
                    {index + 1}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    color: '#e2e8f0',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                  }}
                >
                  {produto.nome}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  sx={{
                    color: '#f8fafc',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                  }}
                >
                  {produto.quantidade} vendas
                </Typography>

                <Typography
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.78rem',
                  }}
                >
                  {formatarDinheiro(
                    produto.valor,
                  )}
                </Typography>
              </Box>
            </Box>
          ),
        )
      )}
    </Paper>
  )
}