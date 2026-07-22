import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import TabelaProdutos from '../components/produtos/TabelaProdutos'
import ModalProduto from '../components/produtos/ModalProduto'
import { listarProdutos } from '../services/produtos'

function Produtos() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [modalAberto, setModalAberto] = useState(false)

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
          onClick={() => setModalAberto(true)}
        >
          Novo Produto
        </Button>
      </Box>

      <TabelaProdutos produtos={produtos} />

      <ModalProduto
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        aoSalvar={carregarProdutos}
      />
    </>
  )
}

export default Produtos