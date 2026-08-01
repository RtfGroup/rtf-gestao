import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material'

interface Props {
  totalReceber: number
  recebidoMes: number
  totalAtrasado: number
  quantidade: number
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function CardResumo({
  titulo,
  valor,
}: {
  titulo: string
  valor: string
}) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          {titulo}
        </Typography>

        <Typography
          variant="h5"
          sx={{ fontWeight: 700 }}
        >
          {valor}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function ResumoFinanceiro({
  totalReceber,
  recebidoMes,
  totalAtrasado,
  quantidade,
}: Props) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2,1fr)',
          lg: 'repeat(4,1fr)',
        },
        gap: 2,
        mb: 3,
      }}
    >
      <CardResumo
        titulo="Total a Receber"
        valor={formatarMoeda(totalReceber)}
      />

      <CardResumo
        titulo="Recebido no Mês"
        valor={formatarMoeda(recebidoMes)}
      />

      <CardResumo
        titulo="Em Atraso"
        valor={formatarMoeda(totalAtrasado)}
      />

      <CardResumo
        titulo="Quantidade de Contas"
        valor={String(quantidade)}
      />
    </Box>
  )
}