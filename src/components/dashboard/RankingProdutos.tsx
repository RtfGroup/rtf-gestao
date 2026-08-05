import { Paper, Typography } from '@mui/material'

export interface ProdutoRanking {
  nome: string
  quantidade: number
  valor: number
}

interface Props {
  produtos: ProdutoRanking[]
}

export default function RankingProdutos({ produtos }: Props) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography
  variant="h6"
  sx={{
    fontWeight: 700,
    mb: 2,
  }}
>
        Produtos mais vendidos
      </Typography>

      {produtos.length === 0 ? (
        <Typography>Nenhum produto vendido.</Typography>
      ) : (
        produtos.map((produto, index) => (
          <Typography key={index} sx={{ mb: 1 }}>
            {index + 1}. {produto.nome} — {produto.quantidade} vendas
          </Typography>
        ))
      )}
    </Paper>
  )
}