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
import MicIcon from '@mui/icons-material/Mic'

import { supabase } from '../lib/supabase'
import { executarAutomacao } from '../engine'

import vendasService, {
  type Cliente,
  type FormaPagamento,
  type ProdutoVenda,
} from '../services/vendas/vendas.service'

interface ItemVendaTela {
  id: number
  produto: string
  quantidade: number
  valorUnitario: number
  desconto: number
}

interface ContextoUsuario {
  empresaId: string
  usuarioId: string
}

export default function NovaVenda() {
  const navigate = useNavigate()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<ProdutoVenda[]>([])
  const [formasPagamento, setFormasPagamento] = useState<
    FormaPagamento[]
  >([])

  const [empresaId, setEmpresaId] = useState('')
  const [usuarioId, setUsuarioId] = useState('')

  const CONSUMIDOR_FINAL = 'CONSUMIDOR_FINAL'
  const [cliente, setCliente] = useState(CONSUMIDOR_FINAL)
  const [dataVenda, setDataVenda] = useState(
    new Date().toISOString().split('T')[0],
  )

  const [tipoVenda, setTipoVenda] = useState('BALCAO')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [numeroParcelas, setNumeroParcelas] = useState(1)

  const [descontoGeral, setDescontoGeral] = useState(0)
  const [acrescimo, setAcrescimo] = useState(0)

  const [observacoes, setObservacoes] = useState('')
  const [observacoesPagamento, setObservacoesPagamento] =
    useState('')

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [escutando, setEscutando] =
  useState(false)
  const [pedidoTexto, setPedidoTexto] =
  useState('')
  const [processandoPedido, setProcessandoPedido] =
  useState(false)

  const [itens, setItens] = useState<ItemVendaTela[]>([
    {
      id: Date.now(),
      produto: '',
      quantidade: 1,
      valorUnitario: 0,
      desconto: 0,
    },
  ])

  useEffect(() => {
    void carregarDados()
  }, [])

  async function obterContextoUsuario(): Promise<ContextoUsuario> {
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

    return {
      empresaId: usuario.empresa_id,
      usuarioId: user.id,
    }
  }

  async function carregarDados() {
    try {
      setCarregando(true)
      setErro('')

      const contexto = await obterContextoUsuario()

      setEmpresaId(contexto.empresaId)
      setUsuarioId(contexto.usuarioId)

      const [
        listaClientes,
        listaProdutos,
        listaFormasPagamento,
      ] = await Promise.all([
        vendasService.listarClientes(contexto.empresaId),
        vendasService.listarProdutos(contexto.empresaId),
        vendasService.listarFormasPagamento(contexto.empresaId),
      ])

      setClientes(listaClientes)

      if (
        cliente !== CONSUMIDOR_FINAL &&
        !listaClientes.some((item) => item.id === cliente)
      ) {
        setCliente(CONSUMIDOR_FINAL)
      }

      setProdutos(listaProdutos)
      setFormasPagamento(listaFormasPagamento)
    } catch (error) {
      console.error('Erro ao carregar dados da venda:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os dados da venda.',
      )
    } finally {
      setCarregando(false)
    }
  }

  function adicionarItem() {
    setItens((itensAtuais) => [
      ...itensAtuais,
      {
        id: Date.now() + Math.random(),
        produto: '',
        quantidade: 1,
        valorUnitario: 0,
        desconto: 0,
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
    campo:
      | 'produto'
      | 'quantidade'
      | 'valorUnitario'
      | 'desconto',
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
              valorUnitario: Number(
                produtoSelecionado?.preco_venda ?? 0,
              ),
            }
          : item,
      ),
    )
  }

  function calcularSubtotalBrutoItem(item: ItemVendaTela) {
    return item.quantidade * item.valorUnitario
  }

  function calcularTotalItem(item: ItemVendaTela) {
    const subtotal = calcularSubtotalBrutoItem(item)
    const desconto = Number(item.desconto) || 0

    return Math.max(subtotal - desconto, 0)
  }

  function calcularSubtotalVenda() {
    return itens.reduce(
      (total, item) => total + calcularSubtotalBrutoItem(item),
      0,
    )
  }

  function calcularDescontoItens() {
    return itens.reduce(
      (total, item) => total + (Number(item.desconto) || 0),
      0,
    )
  }

  function calcularTotalVenda() {
    return Math.max(
      calcularSubtotalVenda() -
        calcularDescontoItens() -
        (Number(descontoGeral) || 0) +
        (Number(acrescimo) || 0),
      0,
    )
  }

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

function iniciarCapturaVoz() {
  setErro('')

  const SpeechRecognition =
    window.SpeechRecognition ??
    window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    setErro(
      'O reconhecimento de voz não é compatível com este navegador.',
    )
    return
  }

  const reconhecimento = new SpeechRecognition()

  reconhecimento.lang = 'pt-BR'
  reconhecimento.continuous = false
  reconhecimento.interimResults = false

  reconhecimento.onresult = (event) => {
    const texto =
      event.results[0][0].transcript

setPedidoTexto(texto)
  }

  reconhecimento.onerror = (event) => {
    setErro(
      `Erro ao reconhecer a voz: ${event.error}`,
    )
  }

  reconhecimento.onend = () => {
    setEscutando(false)
  }

  setEscutando(true)
  reconhecimento.start()
}

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

async function processarPedido() {
  try {
    setErro('')

    if (!pedidoTexto.trim()) {
      setErro('Digite ou fale o pedido.')
      return
    }

    setProcessandoPedido(true)

    const texto = normalizarTexto(pedidoTexto)

    console.clear()

console.log('==============================')
console.log('RTF AI')
console.log('Pedido recebido:')
console.log(texto)
console.log('==============================')

    if (texto.includes('fiado')) {
  setTipoVenda('FIADO')

  const formaFiado = formasPagamento.find(
    (forma) =>
      normalizarTexto(forma.nome) === 'fiado'
  )

  if (formaFiado) {
    setFormaPagamento(formaFiado.id)
  }
} else if (texto.includes('delivery')) {
  setTipoVenda('DELIVERY')
} else if (texto.includes('whatsapp')) {
  setTipoVenda('WHATSAPP')
} else if (
  texto.includes('balcao') ||
  texto.includes('retirada')
) {
  setTipoVenda('BALCAO')
}

const pagamentoEncontrado =
  formasPagamento.find((forma) =>
    texto.includes(
      normalizarTexto(forma.nome),
    ),
  )

if (pagamentoEncontrado) {
  setFormaPagamento(
    pagamentoEncontrado.id,
  )
}

    if (pagamentoEncontrado) {
      setFormaPagamento(
        pagamentoEncontrado.id,
      )
    }

    const clientesOrdenados = [...clientes].sort(
  (a, b) =>
    normalizarTexto(b.nome).length -
    normalizarTexto(a.nome).length,
)

const clienteEncontrado =
  clientesOrdenados.find((item) => {
    const nomeCliente = normalizarTexto(item.nome)

    return (
      nomeCliente.length >= 3 &&
      texto.includes(nomeCliente)
    )
  })

if (clienteEncontrado) {
  setCliente(clienteEncontrado.id)
}

    const itensEncontrados: ItemVendaTela[] =
      []

      const apelidosProdutos = [
  {
    produto: 'Marmitex Grande',
    apelidos: [
      'marmitex g',
      'marmita g',
      'marmita grande',
      'grande',
    ],
  },

  {
    produto: 'Marmitex Média',
    apelidos: [
      'marmitex m',
      'marmita m',
      'marmita media',
      'media',
    ],
  },

  {
    produto: 'Marmitex Pequena',
    apelidos: [
      'marmitex p',
      'marmita p',
      'marmita pequena',
      'pequena',
    ],
  },

  {
    produto: 'PF',
    apelidos: [
      'pf',
      'prato feito',
    ],
  },

  {
    produto: 'Coca',
    apelidos: [
      'coca',
      'coca cola',
      'coca-cola',
    ],
  },
]

    produtos.forEach((produto) => {
      const nomeProduto =
        normalizarTexto(produto.nome)

const configuracaoApelidos =
  apelidosProdutos.find((configuracao) => {
    const produtoConfigurado =
      normalizarTexto(configuracao.produto)

    return (
      produtoConfigurado === nomeProduto ||
      configuracao.apelidos.some(
        (apelido) =>
          normalizarTexto(apelido) ===
          nomeProduto,
      )
    )
  })

const aliases = Array.from(
  new Set([
    nomeProduto,
    nomeProduto.replace(
      'grande',
      'g',
    ),
    nomeProduto.replace(
      'media',
      'm',
    ),
    nomeProduto.replace(
      'pequena',
      'p',
    ),
    nomeProduto.replace(
      'coca-cola',
      'coca',
    ),
    nomeProduto.replace(
      'coca cola',
      'coca',
    ),
    nomeProduto.replace(
      'refeicao por kg',
      'quilo',
    ),
    ...(
      configuracaoApelidos?.apelidos ??
      []
    ).map(normalizarTexto),
  ]),
)

const aliasEncontrado =
  aliases
    .sort(
      (a, b) => b.length - a.length,
    )
    .find((alias) =>
      texto.includes(
        normalizarTexto(alias),
      ),
    )

      if (!aliasEncontrado) {
        return
      }

const existeProdutoMaisEspecifico =
  produtos.some((outroProduto) => {
    if (outroProduto.id === produto.id) {
      return false
    }

    const outroNome =
      normalizarTexto(outroProduto.nome)

    return (
      outroNome.length > nomeProduto.length &&
      texto.includes(outroNome) &&
      (
        outroNome.includes(nomeProduto) ||
        outroNome.includes(
          normalizarTexto(aliasEncontrado),
        )
      )
    )
  })

if (existeProdutoMaisEspecifico) {
  return
}

const regexQuantidadeAntes =
  new RegExp(
    `(\\d+(?:[.,]\\d+)?)\\s*(?:un|und|unidade|unidades|kg|g)?\\s*${aliasEncontrado}`,
    'i',
  )

const regexQuantidadeDepois =
  new RegExp(
    `${aliasEncontrado}\\s*(\\d+(?:[.,]\\d+)?)`,
    'i',
  )

const quantidadeAntes =
  texto.match(regexQuantidadeAntes)

const quantidadeDepois =
  texto.match(regexQuantidadeDepois)

let quantidade = 1

if (quantidadeAntes) {
  quantidade = Number(
    quantidadeAntes[1].replace(',', '.'),
  )
} else if (quantidadeDepois) {
  quantidade = Number(
    quantidadeDepois[1].replace(',', '.'),
  )
}

      itensEncontrados.push({
        id:
          Date.now() +
          Math.random(),
        produto: produto.id,
        quantidade,
        valorUnitario: Number(
          produto.preco_venda ?? 0,
        ),
        desconto: 0,
      })
    })

    if (itensEncontrados.length === 0) {
      setErro(
        'Nenhum produto cadastrado foi identificado no pedido.',
      )
      return
    }

    setItens(itensEncontrados)
  } catch (error) {
    setErro(
      error instanceof Error
        ? error.message
        : 'Não foi possível processar o pedido.',
    )
  } finally {
    setProcessandoPedido(false)
  }
}

  async function salvarVenda() {
    try {
      setErro('')

      if (!empresaId || !usuarioId) {
        setErro('Não foi possível identificar o usuário e a empresa.')
        return
      }

      if (!formaPagamento) {
        setErro('Selecione a forma de pagamento.')
        return
      }

      if (
        tipoVenda === 'FIADO' &&
        cliente === CONSUMIDOR_FINAL
      ) {
        setErro('Selecione um cliente para registrar uma venda fiado.')
        return
      }

      const itemInvalido = itens.some(
        (item) =>
          !item.produto ||
          item.quantidade <= 0 ||
          item.valorUnitario < 0 ||
          item.desconto < 0 ||
          item.desconto >
            item.quantidade * item.valorUnitario,
      )

      if (itemInvalido) {
        setErro(
          'Confira os produtos, quantidades, valores e descontos.',
        )
        return
      }

      if (descontoGeral < 0 || acrescimo < 0) {
        setErro('Desconto e acréscimo não podem ser negativos.')
        return
      }

      if (calcularTotalVenda() <= 0) {
        setErro('O valor total da venda deve ser maior que zero.')
        return
      }

      setSalvando(true)

const venda = await vendasService.registrarVenda({
        empresa_id: empresaId,
        usuario_id: usuarioId,
        cliente_id:
          cliente === CONSUMIDOR_FINAL ? null : cliente,
        forma_pagamento_id: formaPagamento,
        data_venda: `${dataVenda}T12:00:00`,
        tipo_venda: tipoVenda,
        desconto: descontoGeral,
        acrescimo,
        observacoes: observacoes || undefined,
        observacoes_pagamento:
          observacoesPagamento || undefined,
        numero_parcelas: numeroParcelas,
        itens: itens.map((item) => ({
          produto_id: item.produto,
          quantidade: item.quantidade,
          valor_unitario: item.valorUnitario,
          desconto: item.desconto,
        })),
      })
await executarAutomacao({
  empresaId,
  evento: 'VENDA_CRIADA',
  origem: 'ERP',
  referenciaId: venda?.id,
  dados: venda,
})
console.log('RTF ENGINE EXECUTADO')
      navigate('/vendas')
    } catch (error) {
      console.error('Erro ao registrar venda:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar a venda.',
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
          mt: 10,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto' }}>
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 2,
    mb: 3,
  }}
>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Nova Venda
          </Typography>

          <Typography color="text.secondary">
            Registre uma nova saída de produtos.
          </Typography>
        </Box>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/vendas')}
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
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 3 }}
        >
          Dados da venda
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
            fullWidth
            label="Cliente"
            value={cliente}
            onChange={(event) =>
              setCliente(event.target.value)
            }
          >
            <MenuItem value={CONSUMIDOR_FINAL}>
              Consumidor final
            </MenuItem>

            {clientes.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.nome}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            type="date"
            label="Data"
            value={dataVenda}
            onChange={(event) =>
              setDataVenda(event.target.value)
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          <TextField
            select
            fullWidth
            label="Tipo de venda"
            value={tipoVenda}
            onChange={(event) =>
              setTipoVenda(event.target.value)
            }
          >
            <MenuItem value="BALCAO">Balcão</MenuItem>
            <MenuItem value="DELIVERY">Delivery</MenuItem>
            <MenuItem value="WHATSAPP">WhatsApp</MenuItem>
            <MenuItem value="FIADO">Fiado</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            label="Forma de pagamento"
            value={formaPagamento}
            onChange={(event) =>
              setFormaPagamento(event.target.value)
            }
          >
            <MenuItem value="">
              Selecione
            </MenuItem>

            {formasPagamento.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.nome}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
<Box sx={{ width: '100%' }}>

  <Typography
    variant="h6"
    sx={{ fontWeight: 600 }}
  >
    🤖 Assistente de Pedido
  </Typography>

  <Typography
    variant="body2"
    color="text.secondary"
    sx={{ mb: 2 }}
  >
    Digite ou fale o pedido. A IA irá montar a venda automaticamente.
  </Typography>

  <TextField
    fullWidth
    multiline
    rows={2}
    value={pedidoTexto}
    onChange={(event) =>
      setPedidoTexto(event.target.value)
    }
    placeholder="Ex.: 5 marmitex G, 2 Coca-Cola, 850g no quilo..."
  />

  <Box
  sx={{
    display: 'flex',
    gap: 2,
    mt: 2,
  }}
>
<Button
  variant="contained"
  disabled={processandoPedido}
  onClick={() => void processarPedido()}
>
  {processandoPedido
    ? 'Processando...'
    : 'Processar Pedido'}
</Button>

  <Button
    variant="outlined"
    color={
      escutando
        ? 'error'
        : 'primary'
    }
    startIcon={<MicIcon />}
    onClick={iniciarCapturaVoz}
  >
    {escutando
      ? 'Escutando...'
      : 'Falar'}
  </Button>
</Box>

</Box>

<Box
  sx={{
    display: 'flex',
    justifyContent: 'flex-end',
  }}
>
  <Button
    variant="outlined"
    startIcon={<AddIcon />}
    onClick={adicionarItem}
  >
    Adicionar produto
  </Button>
</Box>
        </Box>

        {itens.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '3fr 1fr 1.3fr 1.2fr 1.4fr 50px',
              },
              gap: 2,
              alignItems: 'center',
              mb: 2,
            }}
          >
            <TextField
              select
              size="small"
              label="Produto"
              value={item.produto}
              onChange={(event) =>
                selecionarProduto(
                  item.id,
                  event.target.value,
                )
              }
            >
              <MenuItem value="">Selecione</MenuItem>

              {produtos.map((produto) => (
                <MenuItem
                  key={produto.id}
                  value={produto.id}
                >
                  {produto.nome}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              type="number"
              label="Quantidade"
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
              label="Valor"
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

            <TextField
              size="small"
              type="number"
              label="Desconto"
              value={item.desconto}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              onChange={(event) =>
                atualizarItem(
                  item.id,
                  'desconto',
                  Number(event.target.value),
                )
              }
            />

            <Typography sx={{ fontWeight: 600 }}>
              {formatarMoeda(calcularTotalItem(item))}
            </Typography>

            <IconButton
              color="error"
              disabled={itens.length === 1}
              onClick={() => removerItem(item.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 380px',
            },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Observações
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Informações adicionais sobre a venda..."
              value={observacoes}
              onChange={(event) =>
                setObservacoes(event.target.value)
              }
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Observações do pagamento"
              sx={{ mt: 2 }}
              value={observacoesPagamento}
              onChange={(event) =>
                setObservacoesPagamento(
                  event.target.value,
                )
              }
            />
          </Box>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Resumo
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography color="text.secondary">
                Subtotal
              </Typography>

              <Typography>
                {formatarMoeda(calcularSubtotalVenda())}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography color="text.secondary">
                Desconto dos itens
              </Typography>

              <Typography>
                - {formatarMoeda(calcularDescontoItens())}
              </Typography>
            </Box>

            <TextField
              fullWidth
              type="number"
              label="Desconto geral"
              value={descontoGeral}
              sx={{ mt: 2 }}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              onChange={(event) =>
                setDescontoGeral(
                  Number(event.target.value),
                )
              }
            />

            <TextField
              fullWidth
              type="number"
              label="Acréscimo"
              value={acrescimo}
              sx={{ mt: 2 }}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              onChange={(event) =>
                setAcrescimo(
                  Number(event.target.value),
                )
              }
            />

            <TextField
              fullWidth
              type="number"
              label="Número de parcelas"
              value={numeroParcelas}
              sx={{ mt: 2 }}
              slotProps={{
                htmlInput: {
                  min: 1,
                  step: 1,
                },
              }}
              onChange={(event) =>
                setNumeroParcelas(
                  Math.max(
                    1,
                    Number(event.target.value) || 1,
                  ),
                )
              }
            />

            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600 }}
              >
                Total
              </Typography>

              <Typography
                variant="h4"
                sx={{ fontWeight: 700 }}
              >
                {formatarMoeda(calcularTotalVenda())}
              </Typography>
            </Box>
          </Paper>
        </Box>
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
          onClick={() => navigate('/vendas')}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          disabled={salvando}
          onClick={() => void salvarVenda()}
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
        >
          {salvando
            ? 'Finalizando...'
            : 'Finalizar venda'}
        </Button>
      </Box>
    </Box>
  )
}