import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Snackbar,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import TabelaProdutos from '../components/produtos/TabelaProdutos'
import type { Produto } from '../components/produtos/TabelaProdutos'
import ModalProduto from '../components/produtos/ModalProduto'
import {
  excluirProduto,
  listarProdutos,
} from '../services/produtos'

function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] =
    useState<Produto | null>(null)

  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const carregarProdutos = useCallback(async () => {
    try {
      const dados = await listarProdutos()
      setProdutos(dados ?? [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      setErro('Não foi possível carregar os produtos.')
    }
  }, [])

  useEffect(() => {
    carregarProdutos()
  }, [carregarProdutos])

  function editarProduto(produto: Produto) {
    setProdutoEditando(produto)
    setModalAberto(true)
  }

  function novoProduto() {
    setProdutoEditando(null)
    setModalAberto(true)
  }

  async function removerProduto(produto: Produto) {
    if (!produto.id) {
      setErro('Produto sem identificação.')
      return
    }

    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o produto "${produto.nome ?? ''}"?`,
    )

    if (!confirmou) {
      return
    }

    try {
      await excluirProduto(produto.id)
      await carregarProdutos()
      setMensagem('Produto excluído com sucesso.')
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      setErro('Não foi possível excluir o produto.')
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
          Produtos
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={novoProduto}
        >
          Novo Produto
        </Button>
      </Box>

      <TabelaProdutos
        produtos={produtos}
        aoEditar={editarProduto}
        aoExcluir={removerProduto}
      />

      <ModalProduto
        aberto={modalAberto}
        produto={produtoEditando}
        aoFechar={() => setModalAberto(false)}
        aoSalvar={carregarProdutos}
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

export default Produtos