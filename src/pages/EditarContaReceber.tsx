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
import SaveIcon from '@mui/icons-material/Save'

import { supabase } from '../lib/supabase'

interface Cliente {
  id: string
  nome: string
}

interface ContaReceberBanco {
  id: string
  cliente_id: string | null
  descricao: string | null
  valor_original: number | null
  valor_recebido: number | null
  data_vencimento: string | null
  data_recebimento: string | null
  status: string | null
  forma_pagamento: string | null
  observacoes: string | null
}

export default function EditarContaReceber() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [clientes, setClientes] = useState<Cliente[]>([])

  const [clienteId, setClienteId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valorOriginal, setValorOriginal] = useState(0)
  const [valorRecebido, setValorRecebido] = useState(0)
  const [dataVencimento, setDataVencimento] = useState('')
  const [dataRecebimento, setDataRecebimento] = useState('')
  const [status, setStatus] = useState('PENDENTE')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function iniciar() {
      try {
        setCarregando(true)
        setErro('')

        if (!id) {
          throw new Error('Conta não informada.')
        }

        const [
          { data: conta, error: erroConta },
          { data: listaClientes, error: erroClientes },
        ] = await Promise.all([
          supabase
            .from('contas_receber')
            .select(`
              id,
              cliente_id,
              descricao,
              valor_original,
              valor_recebido,
              data_vencimento,
              data_recebimento,
              status,
              forma_pagamento,
              observacoes
            `)
            .eq('id', id)
            .single(),

          supabase
            .from('clientes')
            .select('id,nome')
            .eq('ativo', true)
            .order('nome'),
        ])

        if (erroConta) {
          throw erroConta
        }

        if (erroClientes) {
          throw erroClientes
        }

        const contaBanco = conta as ContaReceberBanco

        setClientes((listaClientes ?? []) as Cliente[])
        setClienteId(contaBanco.cliente_id ?? '')
        setDescricao(contaBanco.descricao ?? '')
        setValorOriginal(Number(contaBanco.valor_original ?? 0))
        setValorRecebido(Number(contaBanco.valor_recebido ?? 0))
        setDataVencimento(contaBanco.data_vencimento ?? '')
        setDataRecebimento(contaBanco.data_recebimento ?? '')
        setStatus(contaBanco.status ?? 'PENDENTE')
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

    void iniciar()
  }, [id])

  const contaRecebida =
  status?.toUpperCase() === 'RECEBIDO'

  async function salvarConta() {
    try {
      setErro('')

      if (!id) {
        setErro('Conta não informada.')
        return
      }

      if (!descricao.trim()) {
        setErro('Informe a descrição.')
        return
      }

      if (valorOriginal < 0 || valorRecebido < 0) {
        setErro('Os valores não podem ser negativos.')
        return
      }

      if (valorRecebido > valorOriginal) {
        setErro(
          'O valor recebido não pode ser maior que o valor original.',
        )
        return
      }

      if (!dataVencimento) {
        setErro('Informe a data de vencimento.')
        return
      }

      setSalvando(true)

      const statusCalculado =
        valorRecebido >= valorOriginal && valorOriginal > 0
          ? 'RECEBIDO'
          : valorRecebido > 0
            ? 'PARCIAL'
            : status

      const { error } = await supabase
        .from('contas_receber')
        .update({
          cliente_id: clienteId || null,
          descricao: descricao.trim(),
          valor_original: valorOriginal,
          valor_recebido: valorRecebido,
          data_vencimento: dataVencimento,
          data_recebimento: dataRecebimento || null,
          status: statusCalculado,
          forma_pagamento: formaPagamento || null,
          observacoes: observacoes || null,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        throw error
      }

      navigate('/financeiro/contas-receber')
    } catch (error) {
      console.error('Erro ao atualizar conta:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar a conta.',
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

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
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
            Editar conta a receber
          </Typography>

          <Typography color="text.secondary">
            Altere os dados financeiros da conta.
          </Typography>
        </Box>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate('/financeiro/contas-receber')
          }
        >
          Voltar
        </Button>
      </Box>

{contaRecebida && (
  <Alert severity="info" sx={{ mb: 3 }}>
    Esta conta já foi recebida e não pode mais ser alterada.
  </Alert>
)}

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
              md: 'repeat(2, 1fr)',
            },
            gap: 2,
          }}
        >
          <TextField
            select
            fullWidth
            label="Cliente"
            value={clienteId}
            disabled={contaRecebida}
            onChange={(event) =>
              setClienteId(event.target.value)
            }
          >
            <MenuItem value="">
              Cliente não informado
            </MenuItem>

            {clientes.map((cliente) => (
              <MenuItem
                key={cliente.id}
                value={cliente.id}
              >
                {cliente.nome}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Descrição"
            value={descricao}
            disabled={contaRecebida}
            onChange={(event) =>
              setDescricao(event.target.value)
            }
          />

          <TextField
            fullWidth
            type="date"
            label="Data de vencimento"
            value={dataVencimento}
            disabled={contaRecebida}
            onChange={(event) =>
              setDataVencimento(event.target.value)
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            fullWidth
            type="date"
            label="Data de recebimento"
            value={dataRecebimento}
            disabled={contaRecebida}
            onChange={(event) =>
              setDataRecebimento(event.target.value)
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            fullWidth
            type="number"
            label="Valor original"
            value={valorOriginal}
            disabled={contaRecebida}
            slotProps={{
              htmlInput: {
                min: 0,
                step: 0.01,
              },
            }}
            onChange={(event) =>
              setValorOriginal(
                Number(event.target.value),
              )
            }
          />

          <TextField
            fullWidth
            type="number"
            label="Valor recebido"
            value={valorRecebido}
            disabled={contaRecebida}
            slotProps={{
              htmlInput: {
                min: 0,
                step: 0.01,
              },
            }}
            onChange={(event) =>
              setValorRecebido(
                Number(event.target.value),
              )
            }
          />

          <TextField
            select
            fullWidth
            label="Status"
            value={status}
            disabled={contaRecebida}
            onChange={(event) =>
              setStatus(event.target.value)
            }
          >
            <MenuItem value="PENDENTE">Pendente</MenuItem>
            <MenuItem value="PARCIAL">Parcial</MenuItem>
            <MenuItem value="RECEBIDO">Recebido</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Forma de pagamento"
            value={formaPagamento}
            disabled={contaRecebida}
            onChange={(event) =>
              setFormaPagamento(event.target.value)
            }
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Observações
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          value={observacoes}
          disabled={contaRecebida}
          onChange={(event) =>
            setObservacoes(event.target.value)
          }
          placeholder="Informações adicionais da conta..."
        />
      </Paper>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          pb: 4,
        }}
      >
        <Button
          variant="outlined"
          disabled={salvando || contaRecebida}
          onClick={() =>
            navigate('/financeiro/contas-receber')
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
              <SaveIcon />
            )
          }
          disabled={salvando}
          onClick={() => void salvarConta()}
        >
          {contaRecebida
  ? 'Conta já recebida'
  : salvando
    ? 'Salvando...'
    : 'Salvar alterações'}
        </Button>
      </Box>
    </Box>
  )
}