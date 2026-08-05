import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'

import { useNavigate, useParams } from 'react-router-dom'

import { supabase } from '../lib/supabase'

export default function EditarContaPagar() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const [conta, setConta] = useState<any>(null)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)

    const { data, error } = await supabase
  .from('contas_pagar')
  .select('*')
  .eq('id', id)
  .single()

      console.log('ID:', id)
console.log('DATA:', data)
console.log('ERROR:', error)

    if (error) {
      setErro('Não foi possível carregar a conta.')
    } else {
      setConta(data)
    }

    setCarregando(false)
  }

  async function salvar() {
    setSalvando(true)
    setErro('')
    setSucesso('')

    const { error } = await supabase
      .from('contas_pagar')
      .update({
        descricao: conta.descricao,
        data_vencimento: conta.data_vencimento,
        observacoes: conta.observacoes,
      })
      .eq('id', id)

    if (error) {
      setErro('Não foi possível salvar.')
    } else {
      setSucesso('Conta atualizada com sucesso.')
      carregar()
    }

    setSalvando(false)
  }

  if (carregando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!conta) {
    return (
      <Alert severity="error">
        Conta não encontrada.
      </Alert>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography
  variant="h4"
  sx={{ fontWeight: 700 }}
>
  Editar Conta a Pagar
</Typography>

          <Typography color="text.secondary">
            Atualize as informações da conta.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate('/financeiro/contas-pagar')
          }
        >
          Voltar
        </Button>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erro}
        </Alert>
      )}

      {sucesso && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {sucesso}
        </Alert>
      )}

      <Card elevation={2}>
        <CardContent>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 3,
            }}
          >
            <Typography variant="h5">
              Dados da Conta
            </Typography>

            <Chip
              color={
                conta.status === 'PAGO'
                  ? 'success'
                  : 'error'
              }
              label={conta.status}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>

            <Grid size={{ xs: 12, md: 6 }}>
  <TextField
    fullWidth
    label="Fornecedor"
    value="Fornecedor não informado"
    disabled
  />
</Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Descrição"
                value={conta.descricao ?? ''}
                onChange={(e) =>
                  setConta({
                    ...conta,
                    descricao: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="date"
                label="Vencimento"
                slotProps={{
  inputLabel: {
    shrink: true,
  },
}}
                value={conta.data_vencimento ?? ''}
                onChange={(e) =>
                  setConta({
                    ...conta,
                    data_vencimento:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    label="Valor"
    value={`R$ ${Number(
      conta.valor_original ?? 0,
    ).toFixed(2)}`}
    disabled
  />
</Grid>

<Grid size={{ xs: 12, md: 4 }}>
  <TextField
    fullWidth
    label="Saldo"
    value={`R$ ${Math.max(
      Number(conta.valor_original ?? 0) -
        Number(conta.valor_pago ?? 0),
      0,
    ).toFixed(2)}`}
    disabled
  />
</Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Observações"
                value={conta.observacoes ?? ''}
                onChange={(e) =>
                  setConta({
                    ...conta,
                    observacoes:
                      e.target.value,
                  })
                }
              />
            </Grid>

          </Grid>

          <Divider sx={{ my: 4 }} />

          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              p: 0,
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                navigate('/financeiro/contas-pagar')
              }
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={salvando}
              onClick={salvar}
            >
              {salvando
                ? 'Salvando...'
                : 'Salvar Alterações'}
            </Button>
          </Paper>

        </CardContent>
      </Card>
    </Box>
  )
}