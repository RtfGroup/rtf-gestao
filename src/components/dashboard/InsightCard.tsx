import {
  Alert,
  AlertTitle,
  Stack,
} from '@mui/material'

import type { Insight } from '../../engine/ai/insights'

interface Props {
  insights: Insight[]
}

export default function InsightCard({
  insights,
}: Props) {
  if (insights.length === 0) {
    return null
  }

  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      {insights.map((insight, index) => (
        <Alert
          key={index}
          severity={
            insight.tipo === 'ALERTA'
              ? 'warning'
              : insight.tipo === 'SUCESSO'
              ? 'success'
              : 'info'
          }
        >
          <AlertTitle>
            {insight.titulo}
          </AlertTitle>

          {insight.descricao}
        </Alert>
      ))}
    </Stack>
  )
}