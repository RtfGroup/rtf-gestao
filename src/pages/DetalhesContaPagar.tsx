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

import { supabase } from '../lib/supabase'

interface ContaPagar {
  id: string
  fornecedor_id: string | null
  compra_id: string | null
  descricao: string | null
  valor_original: number | null
  valor_pago: number | null
  data_vencimento: string | null
  data_pagamento: string | null
  status: string | null
  forma_pagamento: string | null
  observacoes: string | null
  numero_parcela: number | null
  total_parcelas: number | null
  fornecedor_nome: string
  numero_compra: string | null
  numero_nota: string | null
}

export default function DetalhesContaPagar() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [conta, setConta] = useState<ContaPagar | null>(null)
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

        const { data: contaBanco, error: erroConta } =
          await supabase
            .from('contas_pagar')
            .select(`
              id,
              fornecedor_id,
              compra_id,
              descricao,
              valor_original,
              valor_pago,
              data_vencimento,
              data_pagamento,
              status,
              forma_pagamento,
              observacoes,
              numero_parcela,
              total_parcelas
            `)
            .eq('id', id)
            .single()

        if (erroConta) {
          throw erroConta
        }

        let fornecedorNome = 'Fornecedor não informado'
        let numeroCompra: string | null = null
        let numeroNota: string | null = null
        let fornecedorId = contaBanco.fornecedor_id

        if (contaBanco.compra_id) {
          const { data: compra, error: erroCompra } =
            await supabase
              .from('compras')
              .select(`
                numero_compra,
                numero_nota,
                fornecedor_id
              `)
              .eq('id', contaBanco.compra_id)
              .maybeSingle()

          if (erroCompra) {
            throw erroCompra
          }

          numeroCompra = compra?.numero_compra ?? null
          numeroNota = compra?.numero_nota ?? null

          if (!fornecedorId) {
            fornecedorId = compra?.fornecedor_id ?? null
          }
        }

        if (fornecedorId) {
          const { data: fornecedor, error: erroFornecedor } =
            await supabase
              .from('fornecedores')
              .select('razao_social,nome_fantasia')
              .eq('id', fornecedorId)
              .maybeSingle()

          if (erroFornecedor) {
            throw erroFornecedor
          }

          fornecedorNome =
            fornecedor?.nome_fantasia ||
            fornecedor?.razao_social ||
            'Fornecedor não informado'
        }

        setConta({
          ...contaBanco,
          fornecedor_nome: fornecedorNome,
          numero_compra: numeroCompra,
          numero_nota: numeroNota,
        })
      } catch (error) {
        console.error('Erro ao carregar conta a pagar:', error)

        setErro(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar a conta a pagar.',
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
      case 'PAGO':
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
    return <Alert severity="error">{erro}</Alert>
  }

  if (!conta) {
    return (
      <Alert severity="warning">
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
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Detalhes da conta a pagar
          </Typography>

          <Typography color="text.secondary">
            Consulte os dados da despesa e do pagamento.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate('/financeiro/contas-pagar')
            }
          >
            Voltar
          </Button>

          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() =>
              navigate(
                `/financeiro/contas-pagar/${conta.id}/editar`,
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
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
              Fornecedor
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {conta.fornecedor_nome}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Descrição
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {conta.descricao ?? '-'}
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
              Data do pagamento
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {formatarData(conta.data_pagamento)}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Parcela
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {conta.numero_parcela ?? 1}/
              {conta.total_parcelas ?? 1}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Forma de pagamento
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {conta.forma_pagamento ?? '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Nº da compra
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {conta.numero_compra ?? '-'}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Nota fiscal
            </Typography>

            <Typography sx={{ fontWeight: 600 }}>
              {conta.numero_nota ?? '-'}
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

            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {formatarMoeda(conta.valor_original)}
            </Typography>
          </Box>

          <Box>
            <Typography color="text.secondary">
              Valor pago
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'success.main',
              }}
            >
              {formatarMoeda(conta.valor_pago)}
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
                  saldoPendente > 0
                    ? 'error.main'
                    : 'success.main',
              }}
            >
              {formatarMoeda(saldoPendente)}
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

          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {saldoPendente <= 0
              ? 'Conta totalmente paga'
              : 'Conta com saldo pendente'}
          </Typography>
        </Box>
      </Paper>

      {conta.observacoes && (
        <Paper sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Observações
          </Typography>

          <Typography>{conta.observacoes}</Typography>
        </Paper>
      )}
    </Box>
  )
}