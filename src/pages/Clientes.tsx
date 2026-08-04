import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'

import { supabase } from '../lib/supabase'

interface Cliente {
  id: string
  nome: string
  telefone?: string | null
  email?: string | null
  ativo?: boolean | null
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
const [nomeCliente, setNomeCliente] = useState('')
const [telefoneCliente, setTelefoneCliente] = useState('')
const [emailCliente, setEmailCliente] = useState('')
const [salvandoCliente, setSalvandoCliente] = useState(false)
const [clienteEditando, setClienteEditando] =
  useState<Cliente | null>(null)

  useEffect(() => {
    void carregarClientes()
  }, [])

  async function carregarClientes() {
    try {
      setCarregando(true)
      setErro('')

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser()

      if (erroUsuario || !user) {
        throw new Error('Usuário não autenticado.')
      }

      const { data: usuario, error: erroPerfil } =
        await supabase
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

      const { data, error } = await supabase
        .from('clientes')
.select(`
  id,
  nome,
  telefone,
  email,
  ativo
`)
        .eq('empresa_id', usuario.empresa_id)
        .order('nome')

      if (error) {
        throw error
      }

      setClientes(data ?? [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os clientes.',
      )
    } finally {
      setCarregando(false)
    }
  }
async function salvarCliente() {
  try {
    setSalvandoCliente(true)

const {
  data: { user },
  error: erroUsuario,
} = await supabase.auth.getUser()

if (erroUsuario || !user) {
  throw new Error('Usuário não autenticado.')
}

const { data: usuario, error: erroPerfil } =
  await supabase
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

const dadosCliente = {
  empresa_id: usuario.empresa_id,
  nome: nomeCliente.trim(),
  telefone: telefoneCliente.trim() || null,
  email: emailCliente.trim() || null,
  ativo: true,
}

const { error } = clienteEditando
  ? await supabase
      .from('clientes')
      .update(dadosCliente)
      .eq('id', clienteEditando.id)
  : await supabase
      .from('clientes')
      .insert(dadosCliente)

    if (error) throw error

setNomeCliente('')
setTelefoneCliente('')
setEmailCliente('')
setClienteEditando(null)
setModalAberto(false)

    carregarClientes()
  } catch (error) {
    console.error(error)
  } finally {
    setSalvandoCliente(false)
  }
}

async function excluirCliente(clienteId: string) {
  const confirmou = window.confirm(
    'Tem certeza que deseja excluir este cliente?',
  )

  if (!confirmou) {
    return
  }

  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', clienteId)

    if (error) {
      throw error
    }

    await carregarClientes()
  } catch (error) {
    console.error('Erro ao excluir cliente:', error)

    setErro(
      error instanceof Error
        ? error.message
        : 'Não foi possível excluir o cliente.',
    )
  }
}

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Clientes
          </Typography>

          <Typography color="text.secondary">
            Gerencie os clientes cadastrados.
          </Typography>
        </Box>

<Button
  variant="contained"
  onClick={() => {
    setClienteEditando(null)
    setNomeCliente('')
    setTelefoneCliente('')
    setEmailCliente('')
    setModalAberto(true)
  }}
  startIcon={<AddIcon />}
>
  Novo cliente
</Button>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Nome</strong>
              </TableCell>

              <TableCell>
                <strong>Telefone</strong>
              </TableCell>

              <TableCell>
                <strong>E-mail</strong>
              </TableCell>

              <TableCell align="center">
  <strong>Ações</strong>
</TableCell>

            </TableRow>
          </TableHead>

          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : clientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Nenhum cliente cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              clientes.map((cliente) => (
                <TableRow key={cliente.id} hover>
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>
                    {cliente.telefone ?? '-'}
                  </TableCell>
<TableCell align="center">
  <IconButton
    color="primary"
onClick={() => {
  setClienteEditando(cliente)
  setNomeCliente(cliente.nome)
  setTelefoneCliente(cliente.telefone ?? '')
  setEmailCliente(cliente.email ?? '')
  setModalAberto(true)
}}
  >
    <EditIcon />
  </IconButton>

<IconButton
  color="error"
  onClick={() => void excluirCliente(cliente.id)}
>
  <DeleteIcon />
</IconButton>
</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        maxWidth="sm"
        fullWidth
      >
<DialogTitle>
  {clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}
</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Nome"
            value={nomeCliente}
            onChange={(evento) =>
              setNomeCliente(evento.target.value)
            }
          />

          <TextField
            fullWidth
            margin="normal"
            label="Telefone"
            value={telefoneCliente}
            onChange={(evento) =>
              setTelefoneCliente(evento.target.value)
            }
          />

          <TextField
            fullWidth
            margin="normal"
            label="E-mail"
            value={emailCliente}
            onChange={(evento) =>
              setEmailCliente(evento.target.value)
            }
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setModalAberto(false)}
            disabled={salvandoCliente}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={() => void salvarCliente()}
            disabled={salvandoCliente}
          >
            {salvandoCliente ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}