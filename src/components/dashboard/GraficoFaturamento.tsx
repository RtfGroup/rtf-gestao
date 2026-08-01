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
      sx={{
        p: 3,
        mt: 4,
        borderRadius: 3,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
          }}
        >
          Faturamento dos últimos 7 dias
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Evolução diária das vendas finalizadas.
        </Typography>
      </Box>

      <Box sx={{ width: '100%', height: 320 }}>
        {dados.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">
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
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="data" />

              <YAxis
                tickFormatter={(valor) =>
                  `R$ ${Number(valor).toLocaleString('pt-BR')}`
                }
              />

              <Tooltip
                formatter={(valor) => [
                  formatarMoeda(Number(valor)),
                  'Faturamento',
                ]}
              />

              <Line
                type="monotone"
                dataKey="valor"
                stroke="#d4a72c"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  )
}