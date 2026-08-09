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
      elevation={0}
      sx={{
        p: {
          xs: 2,
          md: 2,
        },
        mb: 0,
        height: 310,
minHeight: 310,
        boxSizing: 'border-box',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',

        background:
          'linear-gradient(135deg, #0d1b2e 0%, #10213b 55%, #0b1728 100%)',

        border:
          '1px solid rgba(212,175,55,0.25)',

        boxShadow:
          '0 14px 40px rgba(15,23,42,0.18)',

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background:
            'linear-gradient(90deg, #d4af37, #f3cf65, transparent 80%)',
        },

        '&::after': {
          content: '""',
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          right: -130,
          top: -170,
          background:
            'radial-gradient(circle, rgba(37,99,235,0.22), transparent 68%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 1.5,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            flexShrink: 0,
            borderRadius: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            background:
              'linear-gradient(145deg, rgba(37,99,235,0.22), rgba(212,175,55,0.10))',

            border:
              '1px solid rgba(96,165,250,0.25)',

            boxShadow:
              '0 0 25px rgba(37,99,235,0.12)',
          }}
        >
          <SmartToyIcon
            sx={{
              color: '#d4af37',
              fontSize: 23,
            }}
          />
        </Box>

        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              sx={{
                color: '#f8fafc',
                fontSize: '1.18rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              RTF AI
            </Typography>

            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: '20px',
                bgcolor: 'rgba(212,175,55,0.12)',
                border:
                  '1px solid rgba(212,175,55,0.30)',
              }}
            >
              <Typography
                sx={{
                  color: '#e7bd45',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                }}
              >
                INTELIGÊNCIA
              </Typography>
            </Box>
          </Box>

          <Typography
            sx={{
              mt: 0.25,
              color: '#94a3b8',
              fontSize: '0.8rem',
            }}
          >
            Resumo executivo inteligente do negócio
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          pl: {
            xs: 0,
            md: '66px',
          },

          maxHeight: 220,
overflowY: 'auto',
pr: 1,

'&::-webkit-scrollbar': {
  width: '6px',
},

'&::-webkit-scrollbar-thumb': {
  backgroundColor: 'rgba(212,175,55,0.45)',
  borderRadius: '10px',
},

'&::-webkit-scrollbar-track': {
  backgroundColor: 'transparent',
},

        }}
      >
        <Typography
          sx={{
            whiteSpace: 'pre-line',
            lineHeight: 1.6,
            color: '#dbe5f1',
            fontSize: {
              xs: '0.86rem',
              md: '0.9rem',
            },
          }}
        >
          {relatorio}
        </Typography>
      </Box>
    </Paper>
  )
}