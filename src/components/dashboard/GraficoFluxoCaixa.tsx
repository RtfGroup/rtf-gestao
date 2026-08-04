import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

export interface DadoFluxoCaixa {
  data: string
  entradas: number
  saidas: number
}

interface Props {
  dados: DadoFluxoCaixa[]
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export default function GraficoFluxoCaixa({
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
          sx={{ fontWeight: 700 }}
        >
          Fluxo de Caixa
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Entradas e saídas dos últimos 7 dias.
        </Typography>
      </Box>

      <Box
        sx={{
          width: '100%',
          height: 320,
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="data" />

            <YAxis
              tickFormatter={(v) =>
                `R$ ${Number(v).toLocaleString('pt-BR')}`
              }
            />

            <Tooltip
              formatter={(v) =>
                formatarMoeda(Number(v))
              }
            />

            <Legend />

            <Bar
              dataKey="entradas"
              name="Entradas"
              fill="#16a34a"
            />

            <Bar
              dataKey="saidas"
              name="Saídas"
              fill="#dc2626"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}