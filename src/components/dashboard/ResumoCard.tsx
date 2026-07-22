import { Card, CardContent, Typography } from '@mui/material'

type ResumoCardProps = {
  titulo: string
  valor: string
}

function ResumoCard({ titulo, valor }: ResumoCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {titulo}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mt: 1,
            fontWeight: 'bold',
          }}
        >
          {valor}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default ResumoCard