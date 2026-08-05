import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PaymentsIcon from '@mui/icons-material/Payments'

import { supabase } from '../lib/supabase'

interface ContaPagar {
  id: string
  descricao: string | null
  valor_original: number | null
  valor_pago: number | null
  data_vencimento: string | null
  status: string | null
  forma_pagamento: string | null
  observacoes: string | null
}

function dataHoje() {
  return new Date().toISOString().split('T')[0]
}

export default function PagarConta() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [conta, setConta] = useState<ContaPagar | null>(null)

  const [valorPagamento, setValorPagamento] = useState(0)
  const [dataPagamento, setDataPagamento] = useState(dataHoje())
  const [formaPagamento, setFormaPagamento] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarConta() {
      try {
        setCarregando(true)
        setErro('')

        if (!id) {
          throw new Error('Conta não informada.')
        }

        const { data, error } = await supabase
          .from('contas_pagar')
          .select(`
            id,
            descricao,
            valor_original,
            valor_pago,
            data_vencimento,
            status,
            forma_pagamento,
            observacoes
          `)
          .eq('id', id)
          .single()

        if (error) {
          throw error
        }

        const contaBanco = data as ContaPagar

        const saldo = Math.max(
          Number(contaBanco.valor_original ?? 0) -
            Number(contaBanco.valor_pago ?? 0),
          0,
        )

        setConta(contaBanco)
        setValorPagamento(saldo)
        setFormaPagamento(contaBanco.forma_pagamento ?? '')
        setObservacoes(contaBanco.observacoes ?? '')
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

  async function confirmarPagamento() {
    try {
      setErro('')

      if (!id || !conta) {
        setErro('Conta não informada.')
        return
      }

      const valorOriginal = Number(conta.valor_original ?? 0)
      const valorJaPago = Number(conta.valor_pago ?? 0)

      const saldoPendente = Math.max(
        valorOriginal - valorJaPago,
        0,
      )

      if (valorPagamento <= 0) {
        setErro('Informe um valor maior que zero.')
        return
      }

      if (valorPagamento > saldoPendente) {
        setErro(
          'O valor não pode ser maior que o saldo pendente.',
        )
        return
      }

      if (!dataPagamento) {
        setErro('Informe a data do pagamento.')
        return
      }

      if (!formaPagamento) {
        setErro('Informe a forma de pagamento.')
        return
      }

      setSalvando(true)

      const novoValorPago =
        valorJaPago + Number(valorPagamento)

      const totalmentePago =
        novoValorPago >= valorOriginal

      const novoStatus = totalmentePago
        ? 'PAGO'
        : 'PARCIAL'

      const { error } = await supabase
        .from('contas_pagar')
        .update({
          valor_pago: novoValorPago,
          data_pagamento: dataPagamento,
          status: novoStatus,
          forma_pagamento: formaPagamento,
          observacoes: observacoes || null,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        throw error
      }

      navigate('/financeiro/contas-pagar')
    } catch (error) {
      console.error('Erro ao pagar conta:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar o pagamento.',
      )
    } finally {
      setSalvando(false)
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

  if (conta?.status?.toUpperCase() === 'PAGO') {
    return (
      <Alert severity="warning">
        Esta conta já foi paga e não pode receber novos pagamentos.
      </Alert>
    )
  }

  if (!conta) {
    return (
      <Alert severity="error">
        Conta a pagar não encontrada.
      </Alert>
    )
  }

  const saldoPendente = Math.max(
    Number(conta.valor_original ?? 0) -
      Number(conta.valor_pago ?? 0),
    0,
  )

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
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
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Pagar Conta
          </Typography>

          <Typography color="text.secondary">
            Registre o pagamento total ou parcial da conta.
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
        <Alert
          severity="error"
          onClose={() => setErro('')}
          sx={{ mb: 3 }}
        >
          {erro}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 3 }}
        >
          Dados da conta
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="Descrição"
            value={conta.descricao ?? '-'}
            disabled
          />

          <TextField
            fullWidth
            label="Valor original"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(Number(conta.valor_original ?? 0))}
            disabled
          />

          <TextField
            fullWidth
            label="Saldo pendente"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(saldoPendente)}
            disabled
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 3 }}
        >
          Informações do pagamento
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            type="number"
            label="Valor do pagamento"
            value={valorPagamento}
            slotProps={{
              htmlInput: {
                min: 0,
                max: saldoPendente,
                step: 0.01,
              },
            }}
            onChange={(event) =>
              setValorPagamento(
                Number(event.target.value),
              )
            }
          />

          <TextField
            fullWidth
            type="date"
            label="Data do pagamento"
            value={dataPagamento}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            onChange={(event) =>
              setDataPagamento(event.target.value)
            }
          />

          <TextField
            select
            fullWidth
            label="Forma de pagamento"
            value={formaPagamento}
            onChange={(event) =>
              setFormaPagamento(event.target.value)
            }
          >
            <MenuItem value="Dinheiro">Dinheiro</MenuItem>
            <MenuItem value="Pix">Pix</MenuItem>
            <MenuItem value="Cartão de débito">
              Cartão de débito
            </MenuItem>
            <MenuItem value="Cartão de crédito">
              Cartão de crédito
            </MenuItem>
            <MenuItem value="Boleto">Boleto</MenuItem>
            <MenuItem value="Transferência">
              Transferência
            </MenuItem>
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Observações"
            value={observacoes}
            onChange={(event) =>
              setObservacoes(event.target.value)
            }
            sx={{
              gridColumn: {
                xs: 'auto',
                md: '1 / -1',
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            variant="outlined"
            disabled={salvando}
            onClick={() =>
              navigate('/financeiro/contas-pagar')
            }
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            startIcon={
              salvando ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <PaymentsIcon />
              )
            }
            disabled={salvando}
            onClick={() => void confirmarPagamento()}
          >
            {salvando
  ? 'Registrando...'
  : 'Confirmar pagamento'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}