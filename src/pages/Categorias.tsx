import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Snackbar,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import TabelaCategorias from '../components/categorias/TabelaCategorias'
import type { Categoria } from '../components/categorias/TabelaCategorias'
import ModalCategoria from '../components/categorias/ModalCategoria'
import {
  excluirCategoria,
  listarCategorias,
} from '../services/categorias'

function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [categoriaEditando, setCategoriaEditando] =
    useState<Categoria | null>(null)

  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const carregarCategorias = useCallback(async () => {
    try {
      const dados = await listarCategorias()
      setCategorias(dados ?? [])
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      setErro('Não foi possível carregar as categorias.')
    }
  }, [])

  useEffect(() => {
    carregarCategorias()
  }, [carregarCategorias])

  function novaCategoria() {
    setCategoriaEditando(null)
    setModalAberto(true)
  }

  function editarCategoria(categoria: Categoria) {
    setCategoriaEditando(categoria)
    setModalAberto(true)
  }

  async function removerCategoria(categoria: Categoria) {
    if (!categoria.id) {
      setErro('Categoria sem identificação.')
      return
    }

    const confirmou = window.confirm(
      `Tem certeza que deseja excluir a categoria "${categoria.nome ?? ''}"?`,
    )

    if (!confirmou) {
      return
    }

    try {
      await excluirCategoria(categoria.id)
      await carregarCategorias()
      setMensagem('Categoria excluída com sucesso.')
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      setErro('Não foi possível excluir a categoria.')
    }
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700 }}
        >
          Categorias
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={novaCategoria}
        >
          Nova Categoria
        </Button>
      </Box>

      <TabelaCategorias
        categorias={categorias}
        aoEditar={editarCategoria}
        aoExcluir={removerCategoria}
      />

      <ModalCategoria
        aberto={modalAberto}
        categoria={categoriaEditando}
        aoFechar={() => setModalAberto(false)}
        aoSalvar={carregarCategorias}
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

      <Snackbar
        open={Boolean(erro)}
        autoHideDuration={4000}
        onClose={() => setErro('')}
      >
        <Alert
          severity="error"
          onClose={() => setErro('')}
        >
          {erro}
        </Alert>
      </Snackbar>
    </>
  )
}

export default Categorias