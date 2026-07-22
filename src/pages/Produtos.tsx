import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import TabelaProdutos from '../components/produtos/TabelaProdutos'
import type { Produto } from '../components/produtos/TabelaProdutos'
import ModalProduto from '../components/produtos/ModalProduto'
import { listarProdutos } from '../services/produtos'

function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] =
    useState<Produto | null>(null)

  const carregarProdutos = useCallback(async () => {
    try {
      const dados = await listarProdutos()
      setProdutos(dados ?? [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
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
      />

      <ModalProduto
        aberto={modalAberto}
        produto={produtoEditando}
        aoFechar={() => setModalAberto(false)}
        aoSalvar={carregarProdutos}
      />
    </>
  )
}

export default Produtos