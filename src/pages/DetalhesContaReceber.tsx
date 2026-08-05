import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'

import {
  listarContasReceber,
  type ContaReceber,
} from '../services/financeiro'

export default function DetalhesContaReceber() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [conta, setConta] = useState<ContaReceber | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarConta() {
      try {
        setCarregando(true)
        setErro('')

        if (!id) {
          throw new Error('Conta não informada.')
        }

        const contas = await listarContasReceber()

        const contaEncontrada = contas.find(
          (item) => item.id === id,
        )

        if (!contaEncontrada) {
          throw new Error('Conta a receber não encontrada.')
        }

        setConta(contaEncontrada)
      } catch (error) {
        console.error('Erro ao carregar conta:', error)

        setErro(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar a conta.',
        )
      } finally {
        setCarregando(false)
      }
    }

    void carregarConta()
  }, [id])

  function formatarMoeda(valor?: number | null) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor ?? 0))
  }

  function formatarData(data?: string | null) {
    if (!data) {
      return '-'
    }

    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'UTC',
    }).format(new Date(data))
  }

  function definirCorStatus():
    | 'success'
    | 'warning'
    | 'error'
    | 'default' {
    switch (conta?.status?.toUpperCase()) {
      case 'RECEBIDO':
        return 'success'

      case 'PARCIAL':
        return 'warning'

      case 'PENDENTE':
        return 'error'

      default:
        return 'default'
    }
  }

  if (carregando) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 10,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (erro) {
    return (
      <Alert severity="error">
        {erro}
      </Alert>
    )
  }

  if (!conta) {
    return (
      <Alert severity="warning">
        Conta a receber não encontrada.
      </Alert>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
          flexDirection: {
            xs: 'column',
            md: 'row',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Detalhes da conta
          </Typography>

          <Typography color="text.secondary">
            Consulte os dados da conta e do recebimento.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate('/financeiro/contas-receber')
            }
          >
            Voltar
          </Button>

          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() =>
              navigate(
                `/financeiro/contas-receber/${conta.id}/editar`,
              )
            }
          >
            Editar
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            Dados da conta
          </Typography>

          <Chip
            label={conta.status ?? 'PENDENTE'}
            color={definirCorStatus()}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          <Box>
            <Typography color="text.secondary">
              Cliente
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {conta.cliente_nome ??
                'Cliente não informado'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Descrição
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {conta.descricao ?? 'Venda fiada'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Vencimento
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {formatarData(conta.data_vencimento)}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Data do recebimento
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {formatarData(conta.data_recebimento)}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Dias em atraso
            </Typography>

            <Typography
              sx={{
                fontWeight: 600,
                color: conta.vencida
                  ? 'error.main'
                  : 'text.primary',
              }}
            >
              {conta.vencida
                ? `${conta.dias_atraso ?? 0} dia(s)`
                : 'Sem atraso'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Código da conta
            </Typography>

            <Typography
              sx={{
                fontWeight: 600,
                wordBreak: 'break-all',
              }}
            >
              {conta.id}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 3 }}
        >
          Resumo financeiro
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          <Box>
            <Typography color="text.secondary">
              Valor original
            </Typography>

            <Typography
              variant="h5"
              sx={{ fontWeight: 700 }}
            >
              {formatarMoeda(conta.valor_original)}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Valor recebido
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'success.main',
              }}
            >
              {formatarMoeda(conta.valor_recebido)}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Saldo pendente
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color:
                  Number(conta.saldo_pendente ?? 0) > 0
                    ? 'error.main'
                    : 'success.main',
              }}
            >
              {formatarMoeda(conta.saldo_pendente)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography color="text.secondary">
            Situação atual
          </Typography>

          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            {Number(conta.saldo_pendente ?? 0) <= 0
              ? 'Conta totalmente recebida'
              : 'Conta com saldo pendente'}
          </Typography>
        </Box>
      </Paper>

      {'observacoes' in conta &&
        typeof conta.observacoes === 'string' &&
        conta.observacoes && (
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Observações
            </Typography>

            <Typography>
              {conta.observacoes}
            </Typography>
          </Paper>
        )}
    </Box>
  )
}