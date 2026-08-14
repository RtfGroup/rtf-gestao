import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PrintIcon from '@mui/icons-material/Print'

import { supabase } from '../lib/supabase'
import '../styles/print.css'

interface ItemVenda {
  id: string
  produto_id: string
  quantidade: number
  valor_unitario: number
  subtotal?: number | null
  produto_nome?: string
  unidade_medida?: string
}

interface Venda {
  id: string
  cliente_id?: string | null
  data_venda?: string | null
  valor_total?: number | null
  status?: string | null
  status_pagamento?: string | null
  observacoes?: string | null
  cliente_nome?: string
}

interface Empresa {
  nome_fantasia?: string | null
  razao_social?: string | null
  cpf_cnpj?: string | null
  telefone?: string | null
  endereco?: string | null
  logo_url?: string | null
}

export default function DetalhesVenda() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [venda, setVenda] = useState<Venda | null>(null)
  const [itens, setItens] = useState<ItemVenda[]>([])
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    void carregarVenda()
  }, [id])

  async function carregarVenda() {
    try {
      setCarregando(true)
      setErro('')

      if (!id) {
        throw new Error('Venda não informada.')
      }

      const { data: dadosVenda, error: erroVenda } = await supabase
        .from('vendas')
        .select(`
          id,
          cliente_id,
          data_venda,
          valor_total,
          status,
          status_pagamento,
          observacoes
        `)
        .eq('id', id)
        .single()

      if (erroVenda) {
        throw erroVenda
      }

      const {
  data: { user },
  error: erroUsuario,
} = await supabase.auth.getUser()

if (erroUsuario || !user) {
  throw new Error('Usuário não autenticado.')
}

const { data: perfil, error: erroPerfil } =
  await supabase
    .from('usuarios')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

if (erroPerfil) {
  throw erroPerfil
}

if (perfil?.empresa_id) {
  const { data: dadosEmpresa, error: erroEmpresa } =
    await supabase
      .from('empresas')
      .select(`
        nome_fantasia,
        razao_social,
        cpf_cnpj,
        telefone,
        endereco,
        logo_url
      `)
      .eq('id', perfil.empresa_id)
      .single()

  if (!erroEmpresa) {
    setEmpresa(dadosEmpresa)
  }
}

      let nomeCliente = 'Consumidor final'

      if (dadosVenda.cliente_id) {
        const { data: cliente, error: erroCliente } = await supabase
          .from('clientes')
          .select('nome')
          .eq('id', dadosVenda.cliente_id)
          .single()

        if (!erroCliente && cliente?.nome) {
          nomeCliente = cliente.nome
        }
      }

      const { data: itensVenda, error: erroItens } = await supabase
        .from('itens_venda')
        .select(`
          id,
          produto_id,
          quantidade,
          valor_unitario,
          subtotal
        `)
        .eq('venda_id', id)

      if (erroItens) {
        throw erroItens
      }

      const itensComProdutos = await Promise.all(
        (itensVenda ?? []).map(async (item) => {
          const { data: produto } = await supabase
            .from('produtos')
            .select('nome, unidade_medida')
            .eq('id', item.produto_id)
            .single()

          return {
            ...item,
            produto_nome: produto?.nome ?? 'Produto não encontrado',
            unidade_medida: produto?.unidade_medida ?? '-',
          }
        }),
      )

      setVenda({
        ...dadosVenda,
        cliente_nome: nomeCliente,
      })

      setItens(itensComProdutos)
    } catch (error) {
      console.error('Erro ao carregar venda:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar a venda.',
      )
    } finally {
      setCarregando(false)
    }
  }

  function formatarMoeda(valor?: number | null) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor ?? 0))
  }

  function formatarData(data?: string | null) {
    if (!data) {
      return '-'
    }

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(data))
  }

  if (carregando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (erro) {
    return <Alert severity="error">{erro}</Alert>
  }

  if (!venda) {
    return <Alert severity="warning">Venda não encontrada.</Alert>
  }

  return (
  <Box
    className="print-document"
    sx={{ maxWidth: 1200, mx: 'auto' }}
  >
      
      <Paper
  className="print-company-header"
  elevation={0}
  sx={{
    p: 3,
    mb: 3,
    borderRadius: '16px',
    border: '1px solid rgba(212,175,55,0.28)',
    background:
      'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  }}
>
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        md: '1.4fr 1fr',
      },
      gap: 3,
      alignItems: 'center',
    }}
  >
    {/* EMPRESA */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
      }}
    >
      {empresa?.logo_url ? (
        <Box
          component="img"
          src={empresa.logo_url}
          alt="Logo da empresa"
          sx={{
            width: 96,
            height: 96,
            objectFit: 'contain',
            borderRadius: '14px',
            border: '1px solid #e5e7eb',
            p: 1,
            backgroundColor: '#fff',
          }}
        />
      ) : (
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: '14px',
            background:
              'linear-gradient(145deg, #0b1626, #101f35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4af37',
            fontSize: 28,
            fontWeight: 900,
          }}
        >
          RTF
        </Box>
      )}

      <Box>
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 900,
            color: '#0b1626',
            lineHeight: 1.1,
            mb: 0.7,
          }}
        >
          {empresa?.nome_fantasia ||
            empresa?.razao_social ||
            'Empresa'}
        </Typography>

        {empresa?.razao_social && (
          <Typography
            sx={{
              color: '#475569',
              fontSize: 13,
              mb: 0.4,
            }}
          >
            {empresa.razao_social}
          </Typography>
        )}

        {empresa?.cpf_cnpj && (
          <Typography
            sx={{
              color: '#475569',
              fontSize: 13,
            }}
          >
            CNPJ/CPF: {empresa.cpf_cnpj}
          </Typography>
        )}

        {empresa?.telefone && (
          <Typography
            sx={{
              color: '#475569',
              fontSize: 13,
            }}
          >
            Telefone: {empresa.telefone}
          </Typography>
        )}

        {empresa?.endereco && (
          <Typography
            sx={{
              color: '#475569',
              fontSize: 13,
              mt: 0.4,
            }}
          >
            {empresa.endereco}
          </Typography>
        )}
      </Box>
    </Box>

    {/* IDENTIFICAÇÃO DA VENDA */}
    <Box
      sx={{
        textAlign: {
          xs: 'left',
          md: 'right',
        },
      }}
    >
      <Typography
        sx={{
          fontSize: 28,
          fontWeight: 900,
          color: '#0b1626',
          letterSpacing: '-0.03em',
          mb: 1.5,
        }}
      >
        COMPROVANTE DE VENDA
      </Typography>

      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'stretch',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          overflow: 'hidden',
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            backgroundColor: '#0b1626',
            color: '#fff',
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          Nº DA VENDA
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1,
            backgroundColor: '#fff',
            color: '#0b1626',
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          #{venda.id.slice(0, 8).toUpperCase()}
        </Box>
      </Box>

      <Typography
        sx={{
          color: '#475569',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        Data da venda: {formatarData(venda.data_venda)}
      </Typography>
    </Box>
  </Box>

  <Box
    sx={{
      mt: 2.5,
      height: '2px',
      background:
        'linear-gradient(90deg, #d4af37 0%, #e7bd45 45%, transparent 100%)',
    }}
  />
</Paper>
      
      <Box
      className="no-print"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Detalhes da venda
          </Typography>

          <Typography color="text.secondary">
            {venda.cliente_nome}
          </Typography>
        </Box>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/vendas')}
        >
          Voltar
        </Button>
      </Box>

      <Paper
  className="print-sale-data"
  elevation={0}
  sx={{
    p: 3,
    mb: 3,
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
  }}
>
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      mb: 2.5,
    }}
  >
    <Box
      sx={{
        width: 5,
        height: 28,
        borderRadius: '4px',
        backgroundColor: '#d4af37',
      }}
    />

    <Typography
      sx={{
        fontSize: 20,
        fontWeight: 900,
        color: '#0b1626',
      }}
    >
      Dados da venda
    </Typography>
  </Box>

  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
      },
      gap: 2,
    }}
  >
    {[
      {
        titulo: 'CLIENTE',
        valor: venda.cliente_nome,
      },
      {
        titulo: 'DATA DA VENDA',
        valor: formatarData(venda.data_venda),
      },
      {
        titulo: 'STATUS',
        valor: venda.status ?? '-',
      },
      {
        titulo: 'PAGAMENTO',
        valor: venda.status_pagamento ?? '-',
      },
      {
        titulo: 'QUANTIDADE DE ITENS',
        valor: String(itens.length),
      },
      {
        titulo: 'VALOR TOTAL',
        valor: formatarMoeda(venda.valor_total),
        destaque: true,
      },
    ].map((campo) => (
      <Box
        key={campo.titulo}
        sx={{
          p: 2,
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          backgroundColor: campo.destaque
            ? '#f8f4e8'
            : '#f8fafc',
        }}
      >
        <Typography
          sx={{
            color: '#64748b',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.06em',
            mb: 0.7,
          }}
        >
          {campo.titulo}
        </Typography>

        <Typography
          sx={{
            color: campo.destaque
              ? '#9a7412'
              : '#0b1626',
            fontSize: campo.destaque ? 20 : 15,
            fontWeight: 800,
          }}
        >
          {campo.valor}
        </Typography>
      </Box>
    ))}
  </Box>
</Paper>

      <Paper
  className="print-products"
  elevation={0}
  sx={{
    p: 3,
    mb: 3,
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
  }}
>
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      mb: 2.5,
    }}
  >
    <Box
      sx={{
        width: 5,
        height: 28,
        borderRadius: '4px',
        backgroundColor: '#d4af37',
      }}
    />

    <Typography
      sx={{
        fontSize: 20,
        fontWeight: 900,
        color: '#0b1626',
      }}
    >
      Produtos
    </Typography>
  </Box>

  <Table>
    <TableHead>
      <TableRow
        sx={{
          backgroundColor: '#0b1626',
        }}
      >
        <TableCell
          sx={{
            color: '#fff',
            fontWeight: 800,
          }}
        >
          Produto
        </TableCell>

        <TableCell
          sx={{
            color: '#fff',
            fontWeight: 800,
          }}
        >
          Unidade
        </TableCell>

        <TableCell
          align="right"
          sx={{
            color: '#fff',
            fontWeight: 800,
          }}
        >
          Quantidade
        </TableCell>

        <TableCell
          align="right"
          sx={{
            color: '#fff',
            fontWeight: 800,
          }}
        >
          Valor unitário
        </TableCell>

        <TableCell
          align="right"
          sx={{
            color: '#fff',
            fontWeight: 800,
          }}
        >
          Subtotal
        </TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {itens.map((item) => {
        const subtotal =
          item.subtotal ??
          Number(item.quantidade) *
            Number(item.valor_unitario)

        return (
          <TableRow key={item.id}>
            <TableCell sx={{ fontWeight: 600 }}>
              {item.produto_nome}
            </TableCell>

            <TableCell>
              {item.unidade_medida}
            </TableCell>

            <TableCell align="right">
              {item.quantidade}
            </TableCell>

            <TableCell align="right">
              {formatarMoeda(item.valor_unitario)}
            </TableCell>

            <TableCell
              align="right"
              sx={{ fontWeight: 700 }}
            >
              {formatarMoeda(subtotal)}
            </TableCell>
          </TableRow>
        )
      })}
    </TableBody>
  </Table>

  <Divider sx={{ my: 3 }} />

  <Box
    sx={{
      display: 'flex',
      justifyContent: 'flex-end',
    }}
  >
    <Box
      sx={{
        minWidth: 260,
        p: 2.5,
        borderRadius: '12px',
        background:
          'linear-gradient(135deg, #0b1626 0%, #13243d 100%)',
        textAlign: 'right',
      }}
    >
      <Typography
        sx={{
          color: '#cbd5e1',
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '0.08em',
        }}
      >
        TOTAL DA VENDA
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          color: '#d4af37',
          fontSize: 30,
          fontWeight: 900,
        }}
      >
        {formatarMoeda(venda.valor_total)}
      </Typography>
    </Box>
  </Box>
</Paper>

      {venda.observacoes && (
  <Paper
    className="print-observations"
    elevation={0}
    sx={{
      p: 3,
      mb: 3,
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#fff',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 26,
          borderRadius: '4px',
          backgroundColor: '#d4af37',
        }}
      />

      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 900,
          color: '#0b1626',
        }}
      >
        Observações
      </Typography>
    </Box>

    <Typography
      sx={{
        color: '#475569',
        lineHeight: 1.6,
      }}
    >
      {venda.observacoes}
    </Typography>
  </Paper>
)}

<Paper
  className="print-footer"
  elevation={0}
  sx={{
    p: 3,
    mb: 3,
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(212,175,55,0.28)',
    background:
      'linear-gradient(135deg, #0b1626 0%, #13243d 100%)',
    textAlign: 'center',
  }}
>
  <Typography
    sx={{
      color: '#d4af37',
      fontSize: 18,
      fontWeight: 900,
      mb: 0.6,
    }}
  >
    Obrigado pela preferência!
  </Typography>

  <Typography
    sx={{
      color: '#cbd5e1',
      fontSize: 12,
    }}
  >
    Comprovante emitido pelo RTF Gestão
  </Typography>

  <Typography
    sx={{
      mt: 0.6,
      color: '#64748b',
      fontSize: 11,
    }}
  >
    Documento gerado automaticamente pelo sistema.
  </Typography>
</Paper>

      <Box
      className="no-print"
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          pb: 4,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/vendas')}
        >
          Voltar
        </Button>

        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
        >
          Imprimir venda
        </Button>
      </Box>
    </Box>
  )
}