import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
Tooltip,
} from '@mui/material'

import RefreshIcon from '@mui/icons-material/Refresh'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import PaymentsIcon from '@mui/icons-material/Payments'

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
  fornecedor_nome?: string | null
}

export default function ContasPagar() {
    const navigate = useNavigate()
  const [contas, setContas] = useState<ContaPagar[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregarContas = useCallback(async () => {
    try {
      setCarregando(true)
      setErro('')

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser()

      if (erroUsuario || !user) {
        throw new Error('Usuário não autenticado.')
      }

      const { data: usuario, error: erroPerfil } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

      if (erroPerfil) {
        throw erroPerfil
      }

      if (!usuario?.empresa_id) {
        throw new Error('Usuário sem empresa vinculada.')
      }

      const { data: contasBanco, error: erroContas } = await supabase
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
  .eq('empresa_id', usuario.empresa_id)
  .order('data_vencimento', { ascending: true })

if (erroContas) {
  throw erroContas
}

const compraIds = [
  ...new Set(
    (contasBanco ?? [])
      .map((conta) => conta.compra_id)
      .filter((compraId): compraId is string =>
        Boolean(compraId),
      ),
  ),
]

let comprasMap = new Map<string, string>()

if (compraIds.length > 0) {
  const { data: comprasBanco, error: erroCompras } =
    await supabase
      .from('compras')
      .select('id,fornecedor_id')
      .in('id', compraIds)

  if (erroCompras) {
    throw erroCompras
  }

  comprasMap = new Map(
    (comprasBanco ?? []).map((compra) => [
      compra.id,
      compra.fornecedor_id,
    ]),
  )
}

const fornecedorIds = [
  ...new Set(
    (contasBanco ?? [])
      .map(
        (conta) =>
          conta.fornecedor_id ||
          (conta.compra_id
            ? comprasMap.get(conta.compra_id)
            : null),
      )
      .filter((fornecedorId): fornecedorId is string =>
        Boolean(fornecedorId),
      ),
  ),
]

let fornecedoresMap = new Map<string, string>()

if (fornecedorIds.length > 0) {
  const { data: fornecedoresBanco, error: erroFornecedores } =
    await supabase
      .from('fornecedores')
      .select('id,razao_social,nome_fantasia')
      .in('id', fornecedorIds)

  if (erroFornecedores) {
    throw erroFornecedores
  }

  fornecedoresMap = new Map(
    (fornecedoresBanco ?? []).map((fornecedor) => [
      fornecedor.id,
      fornecedor.nome_fantasia ||
        fornecedor.razao_social ||
        'Fornecedor não informado',
    ]),
  )
}

const contasFormatadas = (contasBanco ?? []).map((conta) => ({
  ...conta,
fornecedor_nome: (() => {
  const fornecedorId =
    conta.fornecedor_id ||
    (conta.compra_id
      ? comprasMap.get(conta.compra_id)
      : null)

  return fornecedorId
    ? fornecedoresMap.get(fornecedorId) ??
        'Fornecedor não informado'
    : 'Fornecedor não informado'
})(),
}))

setContas(contasFormatadas)
    } catch (error) {
      console.error('Erro ao carregar contas a pagar:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as contas a pagar.',
      )
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregarContas()
  }, [carregarContas])

  const resumo = useMemo(() => {
    const totalPendente = contas.reduce((total, conta) => {
      if (conta.status?.toUpperCase() === 'PAGO') {
        return total
      }

      return (
        total +
        Math.max(
          Number(conta.valor_original ?? 0) -
            Number(conta.valor_pago ?? 0),
          0,
        )
      )
    }, 0)

    const totalPago = contas.reduce(
      (total, conta) =>
        total + Number(conta.valor_pago ?? 0),
      0,
    )

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const totalAtrasado = contas.reduce((total, conta) => {
      if (
        conta.status?.toUpperCase() === 'PAGO' ||
        !conta.data_vencimento
      ) {
        return total
      }

      const vencimento = new Date(
        `${conta.data_vencimento}T12:00:00`,
      )

      if (vencimento >= hoje) {
        return total
      }

      return (
        total +
        Math.max(
          Number(conta.valor_original ?? 0) -
            Number(conta.valor_pago ?? 0),
          0,
        )
      )
    }, 0)

    return {
      totalPendente,
      totalPago,
      totalAtrasado,
      quantidade: contas.length,
    }
  }, [contas])

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

  function definirCorStatus(
    status?: string | null,
  ): 'success' | 'warning' | 'error' | 'default' {
    switch (status?.toUpperCase()) {
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

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Contas a Pagar
          </Typography>

          <Typography color="text.secondary">
            Gerencie despesas, parcelas e pagamentos pendentes.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void carregarContas()}
          disabled={carregando}
        >
          Atualizar
        </Button>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            Total pendente
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {formatarMoeda(resumo.totalPendente)}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            Total pago
          </Typography>

          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: 'success.main' }}
          >
            {formatarMoeda(resumo.totalPago)}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            Total atrasado
          </Typography>

          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: 'error.main' }}
          >
            {formatarMoeda(resumo.totalAtrasado)}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">
            Quantidade
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {resumo.quantidade}
          </Typography>
        </Paper>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Fornecedor</strong>
              </TableCell>

              <TableCell>
                <strong>Descrição</strong>
              </TableCell>

              <TableCell>
                <strong>Vencimento</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Valor</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Pago</strong>
              </TableCell>

              <TableCell align="right">
                <strong>Saldo</strong>
              </TableCell>

              <TableCell align="center">
                <strong>Parcela</strong>
              </TableCell>

              <TableCell align="center">
  <strong>Status</strong>
</TableCell>

<TableCell align="center">
  <strong>Ações</strong>
</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : contas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Nenhuma conta a pagar encontrada.
                </TableCell>
              </TableRow>
            ) : (
              contas.map((conta) => {
                const saldo = Math.max(
                  Number(conta.valor_original ?? 0) -
                    Number(conta.valor_pago ?? 0),
                  0,
                )

                return (
                  <TableRow key={conta.id} hover>
                    <TableCell>
                      {conta.fornecedor_nome}
                    </TableCell>

                    <TableCell>
                      {conta.descricao ?? '-'}
                    </TableCell>

                    <TableCell>
                      {formatarData(conta.data_vencimento)}
                    </TableCell>

                    <TableCell align="right">
                      {formatarMoeda(conta.valor_original)}
                    </TableCell>

                    <TableCell align="right">
                      {formatarMoeda(conta.valor_pago)}
                    </TableCell>

                    <TableCell align="right">
                      {formatarMoeda(saldo)}
                    </TableCell>

                    <TableCell align="center">
                      {conta.numero_parcela ?? 1}/
                      {conta.total_parcelas ?? 1}
                    </TableCell>

                    <TableCell align="center">
  <Chip
    label={conta.status ?? 'PENDENTE'}
    color={definirCorStatus(conta.status)}
    size="small"
  />
</TableCell>

<TableCell align="center">
  <Tooltip title="Visualizar">
    <IconButton
      size="small"
      color="primary"
      onClick={() =>
        navigate(
          `/financeiro/contas-pagar/${conta.id}`,
        )
      }
    >
      <VisibilityIcon fontSize="small" />
    </IconButton>
  </Tooltip>

  {conta.status?.toUpperCase() !== 'PAGO' && (
  <Tooltip title="Editar">
    <IconButton
      size="small"
      color="warning"
      onClick={() =>
        navigate(
          `/financeiro/contas-pagar/${conta.id}/editar`,
        )
      }
    >
      <EditIcon fontSize="small" />
    </IconButton>
  </Tooltip>
)}

 {conta.status?.toUpperCase() !== 'PAGO' && (
  <Tooltip title="Pagar">
    <IconButton
      size="small"
      color="success"
      onClick={() =>
        navigate(
          `/financeiro/contas-pagar/${conta.id}/pagar`,
        )
      }
    >
      <PaymentsIcon fontSize="small" />
    </IconButton>
  </Tooltip>
)}
</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}