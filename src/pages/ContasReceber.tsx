import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Snackbar,
  Typography,
} from '@mui/material'

import RefreshIcon from '@mui/icons-material/Refresh'

import ContasReceberTabela from '../components/financeiro/ContasReceberTabela'
import ModalRecebimento from '../components/financeiro/ModalRecebimento'
import ResumoFinanceiro from '../components/financeiro/ResumoFinanceiro'

import {
  listarContasReceber,
  receberConta,
  type ContaReceber,
} from '../services/financeiro'

interface DadosRecebimento {
  valor: number
  data: string
  observacoes: string
}

function ContasReceber() {
  const [contas, setContas] = useState<ContaReceber[]>([])
  const [contaSelecionada, setContaSelecionada] =
    useState<ContaReceber | null>(null)

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const carregarContas = useCallback(async () => {
    try {
      setCarregando(true)
      setErro('')

      const dados = await listarContasReceber()

      setContas(dados ?? [])
    } catch (error) {
      console.error('Erro ao carregar contas a receber:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as contas a receber.',
      )
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarContas()
  }, [carregarContas])

  const resumo = useMemo(() => {
    const hoje = new Date()
    const mesAtual = hoje.getMonth()
    const anoAtual = hoje.getFullYear()

    const totalReceber = contas.reduce((total, conta) => {
      if (conta.status?.toUpperCase() === 'RECEBIDO') {
        return total
      }

      return total + Number(conta.saldo_pendente ?? 0)
    }, 0)

    const recebidoMes = contas.reduce((total, conta) => {
      if (!conta.data_recebimento) {
        return total
      }

      const dataRecebimento = new Date(
        `${conta.data_recebimento}T12:00:00`,
      )

      const pertenceAoMesAtual =
        dataRecebimento.getMonth() === mesAtual &&
        dataRecebimento.getFullYear() === anoAtual

      if (!pertenceAoMesAtual) {
        return total
      }

      return total + Number(conta.valor_recebido ?? 0)
    }, 0)

    const totalAtrasado = contas.reduce((total, conta) => {
      if (!conta.vencida) {
        return total
      }

      return total + Number(conta.saldo_pendente ?? 0)
    }, 0)

    return {
      totalReceber,
      recebidoMes,
      totalAtrasado,
      quantidade: contas.length,
    }
  }, [contas])

  function abrirRecebimento(conta: ContaReceber) {
    setContaSelecionada(conta)
  }

  function fecharRecebimento() {
    if (salvando) {
      return
    }

    setContaSelecionada(null)
  }

  async function confirmarRecebimento(
    dados: DadosRecebimento,
  ) {
    if (!contaSelecionada) {
      setErro('Nenhuma conta foi selecionada.')
      return
    }

    if (!dados.valor || dados.valor <= 0) {
      setErro('Informe um valor maior que zero.')
      return
    }

    if (
      dados.valor >
      Number(contaSelecionada.saldo_pendente ?? 0)
    ) {
      setErro('O valor não pode ser maior que o saldo pendente.')
      return
    }

    if (!dados.data) {
      setErro('Informe a data do recebimento.')
      return
    }

    try {
      setSalvando(true)
      setErro('')

      await receberConta({
        contaId: contaSelecionada.id,
        valor: dados.valor,
        data: `${dados.data}T12:00:00`,
        observacoes: dados.observacoes,
      })

      setContaSelecionada(null)

      await carregarContas()

      setMensagem('Recebimento registrado com sucesso.')
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar o recebimento.',
      )
    } finally {
      setSalvando(false)
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
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700 }}
          >
            Contas a Receber
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: 'text.secondary' }}
          >
            Gerencie vendas fiadas, recebimentos e contas pendentes.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={carregarContas}
          disabled={carregando}
        >
          Atualizar
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

      <ResumoFinanceiro
        totalReceber={resumo.totalReceber}
        recebidoMes={resumo.recebidoMes}
        totalAtrasado={resumo.totalAtrasado}
        quantidade={resumo.quantidade}
      />

      <ContasReceberTabela
        contas={contas}
        carregando={carregando}
        aoReceber={abrirRecebimento}
      />

      <ModalRecebimento
        aberto={Boolean(contaSelecionada)}
        conta={contaSelecionada}
        carregando={salvando}
        aoCancelar={fecharRecebimento}
        aoConfirmar={confirmarRecebimento}
      />

      <Snackbar
        open={Boolean(mensagem)}
        autoHideDuration={3000}
        onClose={() => setMensagem('')}
      >
        <Alert
          severity="success"
          onClose={() => setMensagem('')}
        >
          {mensagem}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ContasReceber