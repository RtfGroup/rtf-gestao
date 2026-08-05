import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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
  Autocomplete,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

import { supabase } from '../lib/supabase'

import {
  cadastrosCompraService,
  type FornecedorCompra,
  type ProdutoCompra,
} from '../services/compras'

import { criarProduto } from '../services/produtos'

interface ItemCompra {
  id: number
  produto: string
  quantidade: number
  valorUnitario: number
}
export default function EditarCompra() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [fornecedores, setFornecedores] = useState<FornecedorCompra[]>([])
  const [produtos, setProdutos] = useState<ProdutoCompra[]>([])

  const [fornecedor, setFornecedor] = useState('')
  const [dataCompra, setDataCompra] = useState('')
  const [numeroCompra, setNumeroCompra] = useState('')
  const [numeroNota, setNumeroNota] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const [itens, setItens] = useState<ItemCompra[]>([
    {
      id: Date.now(),
      produto: '',
      quantidade: 1,
      valorUnitario: 0,
    },
  ])

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [lendoNota, setLendoNota] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function iniciarPagina() {
      try {
        setCarregando(true)
        setErro('')

        await carregarCadastros()

        if (!id) {
          throw new Error('Compra não informada.')
        }

        await carregarCompra(id)
      } catch (error) {
        console.error('Erro ao abrir compra:', error)

        setErro(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar a compra.',
        )
      } finally {
        setCarregando(false)
      }
    }

    void iniciarPagina()
  }, [id])

  async function carregarCadastros() {
    const [listaFornecedores, listaProdutos] = await Promise.all([
      cadastrosCompraService.listarFornecedores(),
      cadastrosCompraService.listarProdutos(),
    ])

    setFornecedores(listaFornecedores)
    setProdutos(listaProdutos)
  }

async function carregarCompra(compraId: string) {
  const { data: compra, error: erroCompra } = await supabase
    .from('compras')
    .select(`
      fornecedor_id,
      data_compra,
      numero_compra,
      numero_nota,
      observacoes
    `)
    .eq('id', compraId)
    .single()

  if (erroCompra) {
    console.error(erroCompra)
    throw erroCompra
  }

  const { data: itensCompra, error: erroItens } = await supabase
    .from('itens_compra')
    .select(`
      produto_id,
      quantidade,
      valor_unitario
    `)
    .eq('compra_id', compraId)

  if (erroItens) {
    console.error(erroItens)
    throw erroItens
  }

  setFornecedor(compra.fornecedor_id ?? '')
  setDataCompra(compra.data_compra ?? '')
  setNumeroCompra(compra.numero_compra ?? '')
  setNumeroNota(compra.numero_nota ?? '')
  setObservacoes(compra.observacoes ?? '')

  if (itensCompra?.length) {
    setItens(
      itensCompra.map((item, indice) => ({
        id: Date.now() + indice,
        produto: item.produto_id,
        quantidade: Number(item.quantidade),
        valorUnitario: Number(item.valor_unitario),
      })),
    )
  } else {
    setItens([
      {
        id: Date.now(),
        produto: '',
        quantidade: 1,
        valorUnitario: 0,
      },
    ])
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
      throw erroPerfil
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

  function removerItem(itemId: number) {
    setItens((itensAtuais) => {
      if (itensAtuais.length === 1) {
        return itensAtuais
      }

      return itensAtuais.filter((item) => item.id !== itemId)
    })
  }

  function atualizarItem(
    itemId: number,
    campo: 'produto' | 'quantidade' | 'valorUnitario',
    valor: string | number,
  ) {
    setItens((itensAtuais) =>
      itensAtuais.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [campo]: valor,
            }
          : item,
      ),
    )
  }

  function selecionarProduto(itemId: number, produtoId: string) {
    const produtoSelecionado = produtos.find(
      (produto) => produto.id === produtoId,
    )

    setItens((itensAtuais) =>
      itensAtuais.map((item) =>
        item.id === itemId
          ? {
              ...item,
              produto: produtoId,
              valorUnitario:
                produtoSelecionado?.preco_custo ??
                item.valorUnitario,
            }
          : item,
      ),
    )
  }

  function calcularSubtotal(item: ItemCompra) {
    return Number(item.quantidade) * Number(item.valorUnitario)
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

  function normalizarNome(texto: string) {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
  }

  async function lerNotaFiscal(arquivo: File) {
    setLendoNota(true)
    setErro('')

    try {
      const formData = new FormData()
      formData.append('imagem', arquivo)

      const resposta = await fetch(
        'https://gewzswpatgkcfbhhysfo.supabase.co/functions/v1/ler-nota-fiscal',
        {
          method: 'POST',
          body: formData,
        },
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          dados?.erro ?? 'Não foi possível ler a nota fiscal.',
        )
      }

      const nota = dados as {
        fornecedor?: string
        cnpj?: string
        data?: string
        numeroNota?: string
        itens?: Array<{
          nome?: string
          quantidade?: number
          unidade?: string
          valorUnitario?: number
        }>
      }

      if (nota.data) {
        setDataCompra(nota.data)
      }

      if (nota.numeroNota) {
        setNumeroNota(nota.numeroNota)
      }

      if (nota.fornecedor) {
        const empresaId = await obterEmpresaId()
        const nomeFornecedor = normalizarNome(nota.fornecedor)
        const cnpjNota = (nota.cnpj ?? '').replace(/\D/g, '')

        const {
          data: listaFornecedores,
          error: erroFornecedores,
        } = await supabase
          .from('fornecedores')
          .select('id, razao_social, nome_fantasia, cpf_cnpj')
          .eq('empresa_id', empresaId)

        if (erroFornecedores) {
          throw erroFornecedores
        }

        let fornecedorEncontrado = listaFornecedores?.find(
          (item) => {
            const razaoSocial = normalizarNome(
              item.razao_social ?? '',
            )
            const nomeFantasia = normalizarNome(
              item.nome_fantasia ?? '',
            )
            const cnpjCadastrado = (
              item.cpf_cnpj ?? ''
            ).replace(/\D/g, '')

            return (
              (cnpjNota !== '' &&
                cnpjCadastrado === cnpjNota) ||
              (razaoSocial !== '' &&
                razaoSocial.includes(nomeFornecedor)) ||
              (razaoSocial !== '' &&
                nomeFornecedor.includes(razaoSocial)) ||
              (nomeFantasia !== '' &&
                nomeFantasia.includes(nomeFornecedor)) ||
              (nomeFantasia !== '' &&
                nomeFornecedor.includes(nomeFantasia))
            )
          },
        )

        if (!fornecedorEncontrado) {
          const {
            data: novoFornecedor,
            error: erroCriacao,
          } = await supabase
            .from('fornecedores')
            .insert({
              empresa_id: empresaId,
              razao_social: nota.fornecedor,
              nome_fantasia: nota.fornecedor,
              cpf_cnpj: nota.cnpj || null,
              ativo: true,
            })
            .select(
              'id, razao_social, nome_fantasia, cpf_cnpj',
            )
            .single()

          if (erroCriacao) {
            throw erroCriacao
          }

          fornecedorEncontrado = novoFornecedor
          await carregarCadastros()
        }

        setFornecedor(fornecedorEncontrado.id)
      }

      if (nota.itens?.length) {
        const novosItens: ItemCompra[] = []
        const listaProdutosAtualizada = [...produtos]

        for (const [indice, item] of nota.itens.entries()) {
          let produtoEncontrado =
            listaProdutosAtualizada.find(
              (produto) =>
                normalizarNome(produto.nome) ===
                normalizarNome(item.nome ?? ''),
            )

          if (!produtoEncontrado && item.nome) {
            const novoProduto = await criarProduto({
              nome: item.nome,
              descricao: '',
              categoria_id: '',
              codigo: '',
              codigo_barras: '',
              tipo: 'produto',
              unidade_medida: item.unidade ?? 'UN',
              preco_custo: Number(item.valorUnitario ?? 0),
              preco_venda: Number(item.valorUnitario ?? 0),
              controla_estoque: true,
              estoque_minimo: 0,
              estoque_maximo: null,
              ativo: true,
            })

            produtoEncontrado = novoProduto
            listaProdutosAtualizada.push(novoProduto)
          }

          novosItens.push({
            id: Date.now() + indice,
            produto: produtoEncontrado?.id ?? '',
            quantidade: Number(item.quantidade ?? 1),
            valorUnitario: Number(item.valorUnitario ?? 0),
          })
        }

        setProdutos(listaProdutosAtualizada)
        setItens(novosItens)
      }
    } catch (error) {
      console.error('Erro ao ler nota fiscal:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível ler a nota fiscal.',
      )
    } finally {
      setLendoNota(false)
    }
  }

  async function salvarCompra() {
    try {
      setErro('')

      if (!id) {
        setErro('Compra não informada.')
        return
      }

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
          Number(item.quantidade) <= 0 ||
          Number(item.valorUnitario) < 0,
      )

      if (itemInvalido) {
        setErro(
          'Confira os produtos, quantidades e valores da compra.',
        )
        return
      }

      setSalvando(true)

      const { error: erroAtualizacao } = await supabase
        .from('compras')
        .update({
          fornecedor_id: fornecedor,
          numero_compra: numeroCompra || null,
          numero_nota: numeroNota || null,
          data_compra: dataCompra,
          observacoes: observacoes || null,
          valor_total: calcularTotal(),
        })
        .eq('id', id)

      if (erroAtualizacao) {
        throw erroAtualizacao
      }

      const { error: erroExclusaoItens } = await supabase
        .from('itens_compra')
        .delete()
        .eq('compra_id', id)

      if (erroExclusaoItens) {
        throw erroExclusaoItens
      }

      const { error: erroInsercaoItens } = await supabase
        .from('itens_compra')
.insert(
itens.map((item) => ({
  compra_id: id,
  produto_id: item.produto,
  quantidade: Number(item.quantidade),
  valor_unitario: Number(item.valorUnitario),
  subtotal:
    Number(item.quantidade) *
    Number(item.valorUnitario),
}))
)

      if (erroInsercaoItens) {
        throw erroInsercaoItens
      }

      navigate('/compras')
    } catch (error) {
      console.error('Erro ao atualizar compra:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar a compra.',
      )
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    )
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
            Editar Compra
          </Typography>

          <Typography color="text.secondary">
            Altere os dados e produtos da compra.
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
            onChange={(event) =>
              setFornecedor(event.target.value)
            }
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
            onChange={(event) =>
              setDataCompra(event.target.value)
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            label="Nº da compra"
            value={numeroCompra}
            onChange={(event) =>
              setNumeroCompra(event.target.value)
            }
          />

          <TextField
            label="Nota fiscal"
            value={numeroNota}
            onChange={(event) =>
              setNumeroNota(event.target.value)
            }
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

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component="label"
              variant="outlined"
              color="secondary"
              startIcon={<PhotoCameraIcon />}
              disabled={lendoNota}
            >
              {lendoNota
                ? 'Lendo nota...'
                : 'Ler Nota Fiscal'}

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (event) => {
                  const arquivo = event.target.files?.[0]

                  if (!arquivo) {
                    return
                  }

                  await lerNotaFiscal(arquivo)
                  event.target.value = ''
                }}
              />
            </Button>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={adicionarItem}
            >
              Adicionar produto
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns:
              '3fr 1fr 1.5fr 1.5fr 50px',
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
              gridTemplateColumns:
                '3fr 1fr 1.5fr 1.5fr 50px',
              gap: 2,
              alignItems: 'center',
              mb: 2,
            }}
          >
<Autocomplete
  size="small"
  options={produtos}
  value={
    produtos.find(
      (produto) => produto.id === item.produto,
    ) ?? null
  }
  getOptionLabel={(produto) => produto.nome}
  isOptionEqualToValue={(opcao, valor) =>
    opcao.id === valor.id
  }
  onChange={(_evento, produtoSelecionado) => {
    selecionarProduto(
      item.id,
      produtoSelecionado?.id ?? '',
    )
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Selecione ou pesquise"
    />
  )}
/>

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

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
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
          onChange={(event) =>
            setObservacoes(event.target.value)
          }
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
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <SaveIcon />
            )
          }
          disabled={salvando}
          onClick={() => void salvarCompra()}
        >
          {salvando
            ? 'Salvando...'
            : 'Salvar alterações'}
        </Button>
      </Box>
    </Box>
  )
}
[]