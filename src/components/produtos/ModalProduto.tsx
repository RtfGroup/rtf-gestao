import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'

import { criarProduto } from '../../services/produtos'

type ModalProdutoProps = {
  aberto: boolean
  aoFechar: () => void
  aoSalvar: () => void
}

function ModalProduto({
  aberto,
  aoFechar,
  aoSalvar,
}: ModalProdutoProps) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function limparFormulario() {
    setNome('')
    setDescricao('')
    setErro('')
  }

  function fecharModal() {
    limparFormulario()
    aoFechar()
  }

  async function salvarProduto() {
    if (!nome.trim()) {
      setErro('Informe o nome do produto.')
      return
    }

    try {
      setSalvando(true)
      setErro('')

      await criarProduto({
        nome: nome.trim(),
        descricao: descricao.trim(),
      })

      limparFormulario()
      aoSalvar()
      aoFechar()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)

      if (error instanceof Error) {
        setErro(error.message)
      } else {
        setErro('Não foi possível salvar o produto.')
      }
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog
      open={aberto}
      onClose={fecharModal}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Novo Produto</DialogTitle>

      <DialogContent>
        {erro && (
          <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
            {erro}
          </Alert>
        )}

        <TextField
          label="Nome do produto"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Descrição"
          value={descricao}
          onChange={(evento) => setDescricao(evento.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
      </DialogContent>

      <DialogActions>
        <Button
          onClick={fecharModal}
          disabled={salvando}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={salvarProduto}
          disabled={salvando}
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalProduto