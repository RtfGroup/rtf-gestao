import {
  Box,
  Paper,
  Typography,
} from '@mui/material'

import SmartToyIcon from '@mui/icons-material/SmartToy'

import type { Insight } from '../../engine/ai/insights'
import type { Recomendacao } from '../../engine/ai/recomendacoes'

import { gerarRelatorioExecutivo } from '../../engine/ai/relatorioExecutivo'

interface Props {
  insights: Insight[]
  recomendacoes: Recomendacao[]
}

export default function ResumoExecutivoCard({
  insights,
  recomendacoes,
}: Props) {
  if (
    insights.length === 0 &&
    recomendacoes.length === 0
  ) {
    return null
  }

  const relatorio = gerarRelatorioExecutivo(
    insights,
    recomendacoes,
  )

  return (
    <Paper
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 2,
        }}
      >
        <SmartToyIcon color="primary" />

        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            RTF AI
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Resumo executivo do negócio
          </Typography>
        </Box>
      </Box>

      <Typography
        sx={{
          whiteSpace: 'pre-line',
          lineHeight: 1.8,
        }}
      >
        {relatorio}
      </Typography>
    </Paper>
  )
}