import {
  Alert,
  AlertTitle,
  Stack,
} from '@mui/material'

import type { Recomendacao } from '../../engine/ai/recomendacoes'

interface Props {
  recomendacoes: Recomendacao[]
}

export default function RecomendacoesCard({
  recomendacoes,
}: Props) {
  if (recomendacoes.length === 0) {
    return null
  }

  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      {recomendacoes.map((item, index) => (
        <Alert
          key={index}
          severity={
            item.prioridade === 'ALTA'
              ? 'error'
              : item.prioridade === 'MEDIA'
              ? 'warning'
              : 'info'
          }
        >
          <AlertTitle>
            {item.titulo}
          </AlertTitle>

          {item.descricao}
        </Alert>
      ))}
    </Stack>
  )
}