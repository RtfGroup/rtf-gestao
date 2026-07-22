import { Card, CardContent, Typography } from '@mui/material'

type Props = {
  titulo: string
  valor: string
}

function ProdutoCard({ titulo, valor }: Props) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        height: '100%',
      }}
    >
      <CardContent>
        <Typography
          variant="body2"
          component="p"
          color="text.secondary"
        >
          {titulo}
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{
            mt: 1,
            fontWeight: 700,
          }}
        >
          {valor}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default ProdutoCard