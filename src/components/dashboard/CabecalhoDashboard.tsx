import {
  Box,
  Typography,
} from '@mui/material'

export default function CabecalhoDashboard() {
  const agora = new Date()

  const saudacao =
    agora.getHours() < 12
      ? 'Bom dia'
      : agora.getHours() < 18
      ? 'Boa tarde'
      : 'Boa noite'

  const data = agora.toLocaleDateString(
    'pt-BR',
    {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
  )

  return (
    <Box sx={{ mb: 4 }}>
<Typography
  variant="h4"
  sx={{
    fontWeight: 700,
  }}
>
        {saudacao} 👋
      </Typography>

      <Typography
        color="text.secondary"
      >
        {data}
      </Typography>
    </Box>
  )
}