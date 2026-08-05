import { useEffect, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'

import type { ContaReceber } from '../../services/financeiro'

interface Props {
  aberto: boolean
  conta: ContaReceber | null
  carregando?: boolean
  aoCancelar: () => void
  aoConfirmar: (dados: {
    valor: number
    data: string
    observacoes: string
  }) => void
}

function formatarDataHoje() {
  return new Date().toISOString().split('T')[0]
}

export default function ModalRecebimento({
  aberto,
  conta,
  carregando = false,
  aoCancelar,
  aoConfirmar,
}: Props) {
  const [valor, setValor] = useState(0)
  const [data, setData] = useState(formatarDataHoje())
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    if (!conta) return

    setValor(Number(conta.saldo_pendente ?? 0))
    setData(formatarDataHoje())
    setObservacoes('')
  }, [conta])

  return (
    <Dialog
      open={aberto}
      onClose={aoCancelar}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Receber Conta</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
  label="Valor Recebido"
  type="number"
  value={valor}
  slotProps={{
  htmlInput: {
    min: 0,
    step: 0.01,
  },
}}
  onChange={(e) =>
    setValor(Number(e.target.value))
  }
  fullWidth
/>

          <TextField
            label="Data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
slotProps={{
  inputLabel: {
    shrink: true,
  },
}}
            fullWidth
          />

          <TextField
            label="Observações"
            value={observacoes}
            onChange={(e) =>
              setObservacoes(e.target.value)
            }
            multiline
            rows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={aoCancelar}
          disabled={carregando}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          disabled={carregando}
          onClick={() => {
  if (
    conta &&
    valor > Number(conta.saldo_pendente)
  ) {
    alert('O valor informado é maior que o saldo pendente.')
    return
  }

  aoConfirmar({
    valor,
    data,
    observacoes,
  })
}}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  )
}