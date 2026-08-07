import { Paper, Typography, Box } from '@mui/material'

export interface ProdutoRanking {
  nome: string
  quantidade: number
  valor: number
}

interface Props {
  produtos: ProdutoRanking[]
}

export default function RankingProdutos({ produtos }: Props) {
  const formatarDinheiro = (valor: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)

  return (
    <Paper
      sx={{
        p: 3,
        mt: 4,
        borderRadius: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: 2,
          textAlign: 'center',
        }}
      >
        Produtos mais vendidos
      </Typography>

      {produtos.length === 0 ? (
        <Typography
          sx={{
            textAlign: 'center',
          }}
        >
          Nenhum produto vendido no período selecionado.
        </Typography>
      ) : (
        produtos.map((produto, index) => (
          <Box
            key={`${produto.nome}-${index}`}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              py: 1,
              borderBottom:
                index < produtos.length - 1
                  ? '1px solid #eee'
                  : 'none',
            }}
          >
            <Typography>
              <strong>{index + 1}.</strong> {produto.nome}
            </Typography>

            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontWeight: 600 }}>
                {produto.quantidade} vendas
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {formatarDinheiro(produto.valor)}
              </Typography>
            </Box>
          </Box>
        ))
      )}
    </Paper>
  )
}