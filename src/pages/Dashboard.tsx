import { Grid, Typography } from '@mui/material'
import ResumoCard from '../components/dashboard/ResumoCard'

function Dashboard() {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ResumoCard titulo="Vendas Hoje" valor="R$ 0,00" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ResumoCard titulo="Receber" valor="R$ 0,00" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ResumoCard titulo="Pagar" valor="R$ 0,00" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ResumoCard titulo="Estoque" valor="0 Produtos" />
        </Grid>
      </Grid>
    </>
  )
}

export default Dashboard