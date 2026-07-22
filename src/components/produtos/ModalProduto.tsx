import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'

import type { Produto } from './TabelaProdutos'
import {
  atualizarProduto,
  criarProduto,
} from '../../services/produtos'
import { listarCategorias } from '../../services/categorias'

type Categoria = {
  id: string
  nome: string
}

type ModalProdutoProps = {
  aberto: boolean
  produto: Produto | null
  aoFechar: () => void
  aoSalvar: () => void
}

function ModalProduto({
  aberto,
  produto,
  aoFechar,
  aoSalvar,
}: ModalProdutoProps) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (aberto) {
      carregarCategorias()
    }
  }, [aberto])

  useEffect(() => {
    if (produto) {
      setNome(produto.nome ?? '')
      setDescricao(produto.descricao ?? '')
      setCategoriaId(produto.categoria_id ?? '')
    } else {
      limparFormulario()
    }

    setErro('')
  }, [produto, aberto])

  async function carregarCategorias() {
    try {
      const dados = await listarCategorias()
      setCategorias(dados ?? [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      setErro('Não foi possível carregar as categorias.')
    }
  }

  function limparFormulario() {
    setNome('')
    setDescricao('')
    setCategoriaId('')
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

    if (!categoriaId) {
      setErro('Selecione uma categoria.')
      return
    }

    try {
      setSalvando(true)
      setErro('')

      const dadosProduto = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        categoria_id: categoriaId,
      }

      if (produto?.id) {
        await atualizarProduto(produto.id, dadosProduto)
      } else {
        await criarProduto(dadosProduto)
      }

      limparFormulario()
      await aoSalvar()
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
      <DialogTitle>
        {produto ? 'Editar Produto' : 'Novo Produto'}
      </DialogTitle>

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

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Categoria</InputLabel>

          <Select
            value={categoriaId}
            label="Categoria"
            onChange={(evento) => setCategoriaId(evento.target.value)}
          >
            {categorias.map((categoria) => (
              <MenuItem
                key={categoria.id}
                value={categoria.id}
              >
                {categoria.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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