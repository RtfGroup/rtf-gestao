import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Box,
  Paper,
  Typography,
} from '@mui/material'

export interface DadoFaturamento {
  data: string
  valor: number
}

interface Props {
  dados: DadoFaturamento[]
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export default function GraficoFaturamento({
  dados,
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
        mt: 4,
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',

        background:
          'linear-gradient(145deg, #101c2e 0%, #0b1626 100%)',

        border:
          '1px solid rgba(148,163,184,0.12)',

        boxShadow:
          '0 10px 30px rgba(0,0,0,0.18)',

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background:
            'linear-gradient(90deg, #d4af37, #f1c75b, transparent 80%)',
        },
      }}
    >
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 38,
            borderRadius: '10px',
            background:
              'linear-gradient(180deg, #f1c75b, #d4af37)',
          }}
        />

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.02em',
            }}
          >
            Faturamento
          </Typography>

          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.82rem',
            }}
          >
            Evolução das vendas nos últimos 7 dias
          </Typography>
        </Box>
      </Box>

      <Box
  sx={{
    width: '100%',
    height: 240,
  }}
>
        {dados.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              border:
                '1px dashed rgba(148,163,184,0.16)',
              background:
                'rgba(5,14,27,0.22)',
            }}
          >
            <Typography
              sx={{
                color: '#64748b',
                fontSize: '0.9rem',
              }}
            >
              Nenhuma venda encontrada no período.
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={dados}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid
                stroke="rgba(148,163,184,0.10)"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="data"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#94a3b8',
                  fontSize: 12,
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={85}
                tick={{
                  fill: '#94a3b8',
                  fontSize: 12,
                }}
                tickFormatter={(valor) =>
                  `R$ ${Number(
                    valor,
                  ).toLocaleString('pt-BR')}`
                }
              />

              <Tooltip
                formatter={(valor) => [
                  formatarMoeda(Number(valor)),
                  'Faturamento',
                ]}
                contentStyle={{
                  background: '#071426',
                  border:
                    '1px solid rgba(212,175,55,0.30)',
                  borderRadius: '10px',
                  color: '#f8fafc',
                  boxShadow:
                    '0 10px 25px rgba(0,0,0,0.30)',
                }}
                labelStyle={{
                  color: '#d4af37',
                  fontWeight: 700,
                }}
              />

              <Line
                type="monotone"
                dataKey="valor"
                stroke="#d4af37"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: '#d4af37',
                  stroke: '#0b1626',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: '#f1c75b',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  )
}