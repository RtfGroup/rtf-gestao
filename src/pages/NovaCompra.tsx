import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'

import { supabase } from '../lib/supabase'

import {
  cadastrosCompraService,
  comprasService,
  type FornecedorCompra,
  type ProdutoCompra,
} from '../services/compras'

interface ItemCompra {
  id: number
  produto: string
  quantidade: number
  valorUnitario: number
}

export default function NovaCompra() {
  const navigate = useNavigate()

  const [fornecedores, setFornecedores] = useState<FornecedorCompra[]>([])
  const [produtos, setProdutos] = useState<ProdutoCompra[]>([])

  const [fornecedor, setFornecedor] = useState('')
  const [dataCompra, setDataCompra] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [numeroCompra, setNumeroCompra] = useState('')
  const [numeroNota, setNumeroNota] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [itens, setItens] = useState<ItemCompra[]>([
    {
      id: Date.now(),
      produto: '',
      quantidade: 1,
      valorUnitario: 0,
    },
  ])

  useEffect(() => {
    carregarCadastros()
  }, [])

  async function carregarCadastros() {
    try {
      const [listaFornecedores, listaProdutos] = await Promise.all([
        cadastrosCompraService.listarFornecedores(),
        cadastrosCompraService.listarProdutos(),
      ])

      setFornecedores(listaFornecedores)
      setProdutos(listaProdutos)
    } catch (error) {
      console.error(error)
      setErro('Não foi possível carregar fornecedores e produtos.')
    }
  }

  async function obterEmpresaId() {
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
      throw new Error(erroPerfil.message)
    }

    if (!usuario?.empresa_id) {
      throw new Error('Usuário sem empresa vinculada.')
    }

    return usuario.empresa_id
  }

  function adicionarItem() {
    setItens((itensAtuais) => [
      ...itensAtuais,
      {
        id: Date.now(),
        produto: '',
        quantidade: 1,
        valorUnitario: 0,
      },
    ])
  }

  function removerItem(id: number) {
    setItens((itensAtuais) => {
      if (itensAtuais.length === 1) {
        return itensAtuais
      }

      return itensAtuais.filter((item) => item.id !== id)
    })
  }

  function atualizarItem(
    id: number,
    campo: 'produto' | 'quantidade' | 'valorUnitario',
    valor: string | number,
  ) {
    setItens((itensAtuais) =>
      itensAtuais.map((item) =>
        item.id === id
          ? {
              ...item,
              [campo]: valor,
            }
          : item,
      ),
    )
  }

  function selecionarProduto(id: number, produtoId: string) {
    const produtoSelecionado = produtos.find(
      (produto) => produto.id === produtoId,
    )

    setItens((itensAtuais) =>
      itensAtuais.map((item) =>
        item.id === id
          ? {
              ...item,
              produto: produtoId,
              valorUnitario:
                produtoSelecionado?.preco_custo ?? item.valorUnitario,
            }
          : item,
      ),
    )
  }

  function calcularSubtotal(item: ItemCompra) {
    return item.quantidade * item.valorUnitario
  }

  function calcularTotal() {
    return itens.reduce(
      (total, item) => total + calcularSubtotal(item),
      0,
    )
  }

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  async function salvarCompra() {
    try {
      setErro('')

      if (!fornecedor) {
        setErro('Selecione um fornecedor.')
        return
      }

      if (!dataCompra) {
        setErro('Informe a data da compra.')
        return
      }

      const itemInvalido = itens.some(
        (item) =>
          !item.produto ||
          item.quantidade <= 0 ||
          item.valorUnitario < 0,
      )

      if (itemInvalido) {
        setErro(
          'Confira os produtos, quantidades e valores da compra.',
        )
        return
      }

      setSalvando(true)

      const empresaId = await obterEmpresaId()

      await comprasService.registrarCompra({
        empresa_id: empresaId,
        fornecedor_id: fornecedor,
        numero_compra: numeroCompra || undefined,
        numero_nota: numeroNota || undefined,
        data_compra: dataCompra,
        gera_contas_pagar: true,
        observacoes: observacoes || undefined,
        itens: itens.map((item) => ({
          produto_id: item.produto,
          quantidade: item.quantidade,
          valor_unitario: item.valorUnitario,
        })),
      })

      navigate('/compras')
    } catch (error) {
      console.error('Erro ao registrar compra:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar a compra.',
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Nova Compra
          </Typography>

          <Typography color="text.secondary">
            Registre uma nova entrada de produtos.
          </Typography>
        </Box>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/compras')}
        >
          Voltar
        </Button>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Dados da compra
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '2fr 1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          <TextField
            select
            label="Fornecedor"
            value={fornecedor}
            onChange={(event) => setFornecedor(event.target.value)}
            fullWidth
          >
            <MenuItem value="">
              Selecione um fornecedor
            </MenuItem>

            {fornecedores.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.nome}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Data da compra"
            type="date"
            value={dataCompra}
            onChange={(event) => setDataCompra(event.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            label="Nº da compra"
            value={numeroCompra}
            onChange={(event) => setNumeroCompra(event.target.value)}
          />

          <TextField
            label="Nota fiscal"
            value={numeroNota}
            onChange={(event) => setNumeroNota(event.target.value)}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Itens da compra
          </Typography>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={adicionarItem}
          >
            Adicionar produto
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 50px',
            gap: 2,
            mb: 1,
            px: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Produto
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Quantidade
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Valor unitário
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Subtotal
          </Typography>

          <span />
        </Box>

        {itens.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr 50px',
              gap: 2,
              alignItems: 'center',
              mb: 2,
            }}
          >
            <TextField
              select
              size="small"
              value={item.produto}
              onChange={(event) =>
                selecionarProduto(item.id, event.target.value)
              }
            >
              <MenuItem value="">
                Selecione
              </MenuItem>

              {produtos.map((produto) => (
                <MenuItem key={produto.id} value={produto.id}>
                  {produto.nome}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              type="number"
              value={item.quantidade}
              slotProps={{
                htmlInput: {
                  min: 0.001,
                  step: 0.001,
                },
              }}
              onChange={(event) =>
                atualizarItem(
                  item.id,
                  'quantidade',
                  Number(event.target.value),
                )
              }
            />

            <TextField
              size="small"
              type="number"
              value={item.valorUnitario}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              onChange={(event) =>
                atualizarItem(
                  item.id,
                  'valorUnitario',
                  Number(event.target.value),
                )
              }
            />

            <Typography sx={{ fontWeight: 600 }}>
              {formatarMoeda(calcularSubtotal(item))}
            </Typography>

            <IconButton
              color="error"
              onClick={() => removerItem(item.id)}
              disabled={itens.length === 1}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography color="text.secondary">
              Total da compra
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {formatarMoeda(calcularTotal())}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Observações
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Informações adicionais sobre a compra..."
          value={observacoes}
          onChange={(event) => setObservacoes(event.target.value)}
        />
      </Paper>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          pb: 4,
        }}
      >
        <Button
          variant="outlined"
          disabled={salvando}
          onClick={() => navigate('/compras')}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          startIcon={
            salvando ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          disabled={salvando}
          onClick={salvarCompra}
        >
          {salvando ? 'Salvando...' : 'Salvar compra'}
        </Button>
      </Box>
    </Box>
  )
}