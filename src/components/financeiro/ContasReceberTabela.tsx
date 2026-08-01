import {
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
} from '@mui/material'

import PaymentsIcon from '@mui/icons-material/Payments'

import type { ContaReceber } from '../../services/financeiro'

interface Props {
  contas: ContaReceber[]
  carregando: boolean
  aoReceber: (conta: ContaReceber) => void
}

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

export default function ContasReceberTabela({
  contas,
  carregando,
  aoReceber,
}: Props) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Cliente</strong>
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
              <strong>Recebido</strong>
            </TableCell>

            <TableCell align="right">
              <strong>Saldo</strong>
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
              <TableCell colSpan={8} align="center">
                <CircularProgress size={30} />
              </TableCell>
            </TableRow>
          ) : contas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                Nenhuma conta a receber encontrada.
              </TableCell>
            </TableRow>
          ) : (
            contas.map((conta) => {
              const recebida =
                conta.status?.toUpperCase() === 'RECEBIDO'

              return (
                <TableRow key={conta.id} hover>
                  <TableCell>
                    {conta.cliente_nome ?? 'Cliente não informado'}
                  </TableCell>

                  <TableCell>
                    {conta.descricao ?? 'Venda fiada'}
                  </TableCell>

                  <TableCell>
                    {formatarData(conta.data_vencimento)}

                    {conta.vencida && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: 'error.main',
                        }}
                      >
                        {conta.dias_atraso} dia(s) em atraso
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    {formatarMoeda(conta.valor_original)}
                  </TableCell>

                  <TableCell align="right">
                    {formatarMoeda(conta.valor_recebido)}
                  </TableCell>

                  <TableCell align="right">
                    {formatarMoeda(conta.saldo_pendente)}
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={conta.status ?? 'PENDENTE'}
                      color={definirCorStatus(conta.status)}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PaymentsIcon />}
                      disabled={recebida}
                      onClick={() => aoReceber(conta)}
                    >
                      Receber
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}