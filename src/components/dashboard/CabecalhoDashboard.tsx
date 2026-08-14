import {
  Box,
  Typography,
} from '@mui/material'

export default function CabecalhoDashboard() {
  const agora = new Date()

  const horaBrasilia = Number(
    new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      hour12: false,
    }).format(agora),
  )

  const saudacao =
    horaBrasilia < 12
      ? 'Bom dia'
      : horaBrasilia < 18
      ? 'Boa tarde'
      : 'Boa noite'

  const data = new Intl.DateTimeFormat(
    'pt-BR',
    {
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
  ).format(agora)

  const horario = new Intl.DateTimeFormat(
    'pt-BR',
    {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(agora)

  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          lineHeight: 1.15,
        }}
      >
        {saudacao} 👋
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mt: 0.5,
          fontSize: '0.95rem',
        }}
      >
        {data} • {horario}
      </Typography>
    </Box>
  )
}