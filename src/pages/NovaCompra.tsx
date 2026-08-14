import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Autocomplete,
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
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

import { supabase } from '../lib/supabase'
import { executarAutomacao } from '../engine'

import {
  cadastrosCompraService,
  comprasService,
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

export default function NovaCompra() {
  const navigate = useNavigate()

  const abrirLeitorAutomatico =
  new URLSearchParams(window.location.search).get('lerNota') === '1'

const inputNotaRef = useRef<HTMLInputElement | null>(null)
const hashesNotasLidasRef = useRef<Set<string>>(new Set())
  
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
  const [lendoNota, setLendoNota] = useState(false)
const [, setFotosNota] = useState<File[]>([])

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

useEffect(() => {
  if (!abrirLeitorAutomatico) {
    return
  }

  const timer = window.setTimeout(() => {
    inputNotaRef.current?.click()
  }, 400)

  return () => {
    window.clearTimeout(timer)
  }
}, [abrirLeitorAutomatico])

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

async function obterCategoriaAutomatica() {
  const empresaId = await obterEmpresaId()

  const { data: categoriaExistente, error: erroBusca } =
    await supabase
      .from('categorias')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('nome', 'Compras Automáticas')
      .maybeSingle()

  if (erroBusca) {
    throw erroBusca
  }

  if (categoriaExistente?.id) {
    return categoriaExistente.id
  }

  const { data: novaCategoria, error: erroCriacao } =
    await supabase
      .from('categorias')
      .insert({
        empresa_id: empresaId,
        nome: 'Compras Automáticas',
        descricao:
          'Produtos cadastrados automaticamente através da leitura de notas fiscais.',
        ativo: true,
      })
      .select('id')
      .single()

  if (erroCriacao) {
    throw erroCriacao
  }

  return novaCategoria.id
}

function normalizarNome(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

async function gerarHashArquivo(arquivo: File) {
  const buffer = await arquivo.arrayBuffer()

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    buffer,
  )

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function lerNotaFiscal(arquivo: File) {
setLendoNota(true)

try {
  let categoriaAutomaticaId: string | null = null
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

console.log(JSON.stringify(dados, null, 2))

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

const empresaId = await obterEmpresaId()

const { data: numeroGerado, error: erroNumero } = await supabase.rpc(
  'gerar_numero_compra',
  {
    p_empresa_id: empresaId,
  },
)

if (erroNumero) {
  throw erroNumero
}

if (numeroGerado) {
  setNumeroCompra(numeroGerado)
}

if (nota.fornecedor) {
  const empresaId = await obterEmpresaId()
  const nomeFornecedor = normalizarNome(nota.fornecedor)
  const cnpjNota = (nota.cnpj ?? '').replace(/\D/g, '')

  const { data: listaFornecedores, error: erroFornecedores } =
    await supabase
      .from('fornecedores')
      .select('id, razao_social, nome_fantasia, cpf_cnpj')
      .eq('empresa_id', empresaId)

  if (erroFornecedores) {
    throw erroFornecedores
  }

  let fornecedorEncontrado = listaFornecedores?.find((item) => {
    const razaoSocial = normalizarNome(item.razao_social ?? '')
    const nomeFantasia = normalizarNome(item.nome_fantasia ?? '')
    const cnpjCadastrado = (item.cpf_cnpj ?? '').replace(/\D/g, '')

    return (
      (cnpjNota && cnpjCadastrado === cnpjNota) ||
      razaoSocial.includes(nomeFornecedor) ||
      nomeFornecedor.includes(razaoSocial) ||
      nomeFantasia.includes(nomeFornecedor) ||
      nomeFornecedor.includes(nomeFantasia)
    )
  })

  if (!fornecedorEncontrado) {
    const { data: novoFornecedor, error: erroCriacao } = await supabase
      .from('fornecedores')
      .insert({
        empresa_id: empresaId,
        razao_social: nota.fornecedor,
        nome_fantasia: nota.fornecedor,
        cpf_cnpj: nota.cnpj || null,
        ativo: true,
      })
      .select('id, razao_social, nome_fantasia, cpf_cnpj')
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
  const produtosDisponiveis = await cadastrosCompraService.listarProdutos()

  for (const [indice, item] of nota.itens.entries()) {
    const nomeItem = normalizarNome(item.nome ?? '')

    let produtoEncontrado = produtosDisponiveis.find(
      (produto) =>
        normalizarNome(produto.nome) === nomeItem,
    )

    if (!produtoEncontrado && item.nome) {
  if (!categoriaAutomaticaId) {
    categoriaAutomaticaId =
      await obterCategoriaAutomatica()
  }
      
      const novoProduto = await criarProduto({
        nome: item.nome,
        descricao: '',
        categoria_id: categoriaAutomaticaId!,
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
      produtosDisponiveis.push(novoProduto)
    }

    if (!produtoEncontrado) {
      continue
    }

    const itemJaAdicionado = novosItens.find(
      (itemCompra) =>
        itemCompra.produto === produtoEncontrado?.id,
    )

    if (itemJaAdicionado) {
      itemJaAdicionado.quantidade += Number(
        item.quantidade ?? 1,
      )

      itemJaAdicionado.valorUnitario = Number(
        item.valorUnitario ?? itemJaAdicionado.valorUnitario,
      )

      continue
    }

    novosItens.push({
      id: Date.now() + indice,
      produto: produtoEncontrado.id,
      quantidade: Number(item.quantidade ?? 1),
      valorUnitario: Number(item.valorUnitario ?? 0),
    })
  }

  setProdutos(produtosDisponiveis)

setItens((itensAtuais) => {
  if (novosItens.length === 0) {
    return itensAtuais
  }

  const itensValidos = itensAtuais.filter(
    (item) => item.produto !== '',
  )

  const itensCombinados = [...itensValidos]

  for (const novoItem of novosItens) {
    const existente = itensCombinados.find(
      (item) => item.produto === novoItem.produto,
    )

    if (existente) {
      existente.quantidade += novoItem.quantidade
      existente.valorUnitario =
        novoItem.valorUnitario
    } else {
      itensCombinados.push(novoItem)
    }
  }

  return itensCombinados
})
}
} catch (error) {
  console.error(error)
} finally {
  setLendoNota(false)
}
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

const compra = await comprasService.registrarCompra({
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
      console.log('ANTES DO ENGINE')
await executarAutomacao({
  empresaId,
  evento: 'COMPRA_CRIADA',
  origem: 'ERP',
referenciaId: compra,
dados: {
  compraId: compra,
  fornecedorId: fornecedor,
  valorTotal: calcularTotal(),
},
})
console.log('DEPOIS DO ENGINE')
console.log('RTF ENGINE COMPRA EXECUTADO')
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

<Box sx={{ display: 'flex', gap: 2 }}>
<Button
  component="label"
  variant="outlined"
  color="secondary"
  autoFocus={abrirLeitorAutomatico}
  startIcon={<PhotoCameraIcon />}
  disabled={lendoNota}
>
  {lendoNota ? 'Lendo Nota...' : 'Ler Nota Fiscal'}

  <input
  ref={inputNotaRef}
  type="file"
  accept="image/*"
  multiple
  hidden
onChange={async (event) => {
  const arquivos = Array.from(
    event.target.files ?? [],
  )

  if (arquivos.length === 0) {
    return
  }

  const arquivosNovos: File[] = []

  for (const arquivo of arquivos) {
    const hash = await gerarHashArquivo(arquivo)

    if (hashesNotasLidasRef.current.has(hash)) {
      console.warn(
        'Foto da nota ignorada porque já foi processada:',
        arquivo.name,
      )

      continue
    }

    hashesNotasLidasRef.current.add(hash)
    arquivosNovos.push(arquivo)
  }

  if (arquivosNovos.length === 0) {
    event.target.value = ''
    return
  }

  setFotosNota(arquivosNovos)

  for (const arquivo of arquivosNovos) {
    await lerNotaFiscal(arquivo)
  }

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
            <Autocomplete
  size="small"
  options={produtos}
  getOptionLabel={(option) => option.nome}
  value={
    produtos.find(
      (produto) => produto.id === item.produto,
    ) ?? null
  }
  onChange={(_, novoProduto) => {
    selecionarProduto(
      item.id,
      novoProduto?.id ?? '',
    )
  }}
  isOptionEqualToValue={(option, value) =>
    option.id === value.id
  }
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