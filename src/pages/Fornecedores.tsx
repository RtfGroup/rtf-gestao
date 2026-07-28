import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
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

import {
  criarFornecedor,
  listarFornecedores,
  type Fornecedor,
} from '../services/fornecedores'

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])

  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [razaoSocial, setRazaoSocial] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')

  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregarFornecedores()
  }, [])

  async function carregarFornecedores() {
    try {
      const dados = await listarFornecedores()
      setFornecedores(dados)
    } catch (error) {
      console.error(error)
      setErro('Não foi possível carregar os fornecedores.')
    }
  }

  function abrirNovoFornecedor() {
    setRazaoSocial('')
    setNomeFantasia('')
    setCpfCnpj('')
    setTelefone('')
    setEmail('')
    setModalAberto(true)
  }

  function fecharModal() {
    if (!salvando) {
      setModalAberto(false)
    }
  }

  async function salvarFornecedor() {
    try {
      setErro('')

      if (!razaoSocial.trim() && !nomeFantasia.trim()) {
        setErro('Informe a razão social ou o nome fantasia.')
        return
      }

      setSalvando(true)

      await criarFornecedor({
        razao_social: razaoSocial.trim(),
        nome_fantasia: nomeFantasia.trim(),
        cpf_cnpj: cpfCnpj.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
      })

      await carregarFornecedores()

      setModalAberto(false)
      setMensagem('Fornecedor cadastrado com sucesso.')
    } catch (error) {
      console.error(error)

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível cadastrar o fornecedor.',
      )
    } finally {
      setSalvando(false)
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
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Fornecedores
          </Typography>

          <Typography color="text.secondary">
            Cadastre e gerencie os fornecedores da empresa.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={abrirNovoFornecedor}
        >
          Novo Fornecedor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Nome</strong>
              </TableCell>

              <TableCell>
                <strong>CPF/CNPJ</strong>
              </TableCell>

              <TableCell>
                <strong>Telefone</strong>
              </TableCell>

              <TableCell>
                <strong>E-mail</strong>
              </TableCell>

              <TableCell align="center">
                <strong>Status</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {fornecedores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhum fornecedor cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              fornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id} hover>
                  <TableCell>
                    {fornecedor.nome_fantasia ||
                      fornecedor.razao_social ||
                      'Sem nome'}
                  </TableCell>

                  <TableCell>
                    {fornecedor.cpf_cnpj || '-'}
                  </TableCell>

                  <TableCell>
                    {fornecedor.telefone || '-'}
                  </TableCell>

                  <TableCell>
                    {fornecedor.email || '-'}
                  </TableCell>

                  <TableCell align="center">
                    {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={modalAberto}
        onClose={fecharModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Novo Fornecedor</DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              pt: 1,
            }}
          >
            <TextField
              label="Razão social"
              value={razaoSocial}
              onChange={(event) =>
                setRazaoSocial(event.target.value)
              }
              fullWidth
            />

            <TextField
              label="Nome fantasia"
              value={nomeFantasia}
              onChange={(event) =>
                setNomeFantasia(event.target.value)
              }
              fullWidth
            />

            <TextField
              label="CPF / CNPJ"
              value={cpfCnpj}
              onChange={(event) =>
                setCpfCnpj(event.target.value)
              }
              fullWidth
            />

            <TextField
              label="Telefone"
              value={telefone}
              onChange={(event) =>
                setTelefone(event.target.value)
              }
              fullWidth
            />

            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              fullWidth
            />
          </Box>
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
            onClick={salvarFornecedor}
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  )
}