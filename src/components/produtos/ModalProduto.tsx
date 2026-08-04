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
  const [codigo, setCodigo] = useState('')
const [codigoBarras, setCodigoBarras] = useState('')
const [tipo, setTipo] = useState('produto')
const [unidadeMedida, setUnidadeMedida] =
  useState('unidade')
const [precoCusto, setPrecoCusto] = useState(0)
const [precoVenda, setPrecoVenda] = useState(0)
const [controlaEstoque, setControlaEstoque] =
  useState(true)
const [estoqueMinimo, setEstoqueMinimo] =
  useState(0)
const [estoqueMaximo, setEstoqueMaximo] =
  useState<number | null>(null)
const [ativo, setAtivo] = useState(true)
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
setCodigo(produto.codigo ?? '')
setCodigoBarras(produto.codigo_barras ?? '')
setTipo(produto.tipo ?? 'produto')
setUnidadeMedida(
  produto.unidade_medida ?? 'unidade',
)
setPrecoCusto(
  Number(produto.preco_custo ?? 0),
)
setPrecoVenda(
  Number(produto.preco_venda ?? 0),
)
setControlaEstoque(
  produto.controla_estoque ?? true,
)
setEstoqueMinimo(
  Number(produto.estoque_minimo ?? 0),
)
setEstoqueMaximo(
  produto.estoque_maximo === null ||
    produto.estoque_maximo === undefined
    ? null
    : Number(produto.estoque_maximo),
)
setAtivo(produto.ativo ?? true)
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
  setCodigo('')
  setCodigoBarras('')
  setTipo('produto')
  setUnidadeMedida('unidade')
  setPrecoCusto(0)
  setPrecoVenda(0)
  setControlaEstoque(true)
  setEstoqueMinimo(0)
  setEstoqueMaximo(null)
  setAtivo(true)
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

  codigo: codigo.trim(),
  codigo_barras: codigoBarras.trim(),

  tipo,
  unidade_medida: unidadeMedida,

  preco_custo: Number(precoCusto) || 0,
  preco_venda: Number(precoVenda) || 0,

  controla_estoque: controlaEstoque,

  estoque_minimo:
    Number(estoqueMinimo) || 0,

  estoque_maximo:
    estoqueMaximo === null
      ? null
      : Number(estoqueMaximo),

  ativo,
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

<TextField
  label="Código"
  value={codigo}
  onChange={(evento) =>
    setCodigo(evento.target.value)
  }
  fullWidth
  margin="normal"
/>

<TextField
  label="Código de barras"
  value={codigoBarras}
  onChange={(evento) =>
    setCodigoBarras(evento.target.value)
  }
  fullWidth
  margin="normal"
/>

<FormControl fullWidth margin="normal">
  <InputLabel>Tipo</InputLabel>

  <Select
    value={tipo}
    label="Tipo"
    onChange={(evento) =>
      setTipo(evento.target.value)
    }
  >
    <MenuItem value="produto">Produto</MenuItem>
    <MenuItem value="servico">Serviço</MenuItem>
  </Select>
</FormControl>

<FormControl fullWidth margin="normal">
  <InputLabel>Unidade de medida</InputLabel>

  <Select
    value={unidadeMedida}
    label="Unidade de medida"
    onChange={(evento) =>
      setUnidadeMedida(evento.target.value)
    }
  >
    <MenuItem value="unidade">Unidade</MenuItem>
    <MenuItem value="kg">Quilograma</MenuItem>
    <MenuItem value="g">Grama</MenuItem>
    <MenuItem value="litro">Litro</MenuItem>
    <MenuItem value="ml">Mililitro</MenuItem>
  </Select>
</FormControl>

<TextField
  label="Preço de custo"
  type="number"
  value={precoCusto}
  onChange={(evento) =>
    setPrecoCusto(Number(evento.target.value))
  }
  fullWidth
  margin="normal"
/>

<TextField
  label="Preço de venda"
  type="number"
  value={precoVenda}
  onChange={(evento) =>
    setPrecoVenda(Number(evento.target.value))
  }
  fullWidth
  margin="normal"
/>

<TextField
  label="Estoque mínimo"
  type="number"
  value={estoqueMinimo}
  onChange={(evento) =>
    setEstoqueMinimo(Number(evento.target.value))
  }
  fullWidth
  margin="normal"
/>

<TextField
  label="Estoque máximo"
  type="number"
  value={estoqueMaximo ?? ''}
  onChange={(evento) =>
    setEstoqueMaximo(
      evento.target.value === ''
        ? null
        : Number(evento.target.value),
    )
  }
  fullWidth
  margin="normal"
/>

<FormControl fullWidth margin="normal">
  <InputLabel>Controla estoque</InputLabel>

  <Select
    value={controlaEstoque ? 'sim' : 'nao'}
    label="Controla estoque"
    onChange={(evento) =>
      setControlaEstoque(
        evento.target.value === 'sim',
      )
    }
  >
    <MenuItem value="sim">Sim</MenuItem>
    <MenuItem value="nao">Não</MenuItem>
  </Select>
</FormControl>

<FormControl fullWidth margin="normal">
  <InputLabel>Status</InputLabel>

  <Select
    value={ativo ? 'ativo' : 'inativo'}
    label="Status"
    onChange={(evento) =>
      setAtivo(
        evento.target.value === 'ativo',
      )
    }
  >
    <MenuItem value="ativo">Ativo</MenuItem>
    <MenuItem value="inativo">Inativo</MenuItem>
  </Select>
</FormControl>

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