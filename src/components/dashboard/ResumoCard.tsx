import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'

type ResumoCardProps = {
  titulo: string
  valor: string
  icone?: ReactNode
  cor?: string
}

function ResumoCard({
  titulo,
  valor,
  icone,
  cor = '#d4af37',
}: ResumoCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight: 85,
        borderRadius: '14px',
        position: 'relative',
        overflow: 'hidden',

        background:
          'linear-gradient(145deg, #101c2e 0%, #0b1626 100%)',

        border:
          '1px solid rgba(148,163,184,0.12)',

        boxShadow:
          '0 8px 24px rgba(0,0,0,0.18)',

        transition:
          'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',

        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor:
            'rgba(212,175,55,0.40)',
          boxShadow:
            '0 12px 30px rgba(0,0,0,0.26)',
        },

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background:
            'linear-gradient(90deg, #d4af37, #f1c75b, transparent 85%)',
        },

        '&::after': {
          content: '""',
          position: 'absolute',
          width: 110,
          height: 110,
          borderRadius: '50%',
          right: -55,
          top: -60,
          background:
            'radial-gradient(circle, rgba(212,175,55,0.13), transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <CardContent
        sx={{
          p: 1.6,
          height: '100%',
          display: 'flex',
          alignItems: 'center',

          '&:last-child': {
            pb: 1.6,
          },
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 40,
            borderRadius: '12px',
            flexShrink: 0,
            mr: 1.5,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            color: cor,
            background: `${cor}18`,
            border: `1px solid ${cor}30`,

            boxShadow: `0 0 20px ${cor}15`,

            '& svg': {
              fontSize: 28,
            },
          }}
        >
          {icone}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            {titulo}
          </Typography>

          <Typography
            sx={{
              mt: 0.65,
              color: '#f8fafc',
              fontSize: {
                xs: '1.35rem',
                md: '1.6rem',
              },
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            {valor}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ResumoCard