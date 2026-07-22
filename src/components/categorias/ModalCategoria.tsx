import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'

import FormularioCategoria from './FormularioCategoria'
import type { Categoria } from './TabelaCategorias'
import {
  atualizarCategoria,
  criarCategoria,
} from '../../services/categorias'

type ModalCategoriaProps = {
  aberto: boolean
  categoria: Categoria | null
  aoFechar: () => void
  aoSalvar: () => Promise<void>
}

function ModalCategoria({
  aberto,
  categoria,
  aoFechar,
  aoSalvar,
}: ModalCategoriaProps) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState('produto')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (categoria) {
      setNome(categoria.nome ?? '')
      setDescricao(categoria.descricao ?? '')
      setTipo(categoria.tipo ?? 'produto')
    } else {
      setNome('')
      setDescricao('')
      setTipo('produto')
    }

    setErro('')
  }, [categoria, aberto])

  async function salvarCategoria() {
    if (!nome.trim()) {
      setErro('Informe o nome da categoria.')
      return
    }

    try {
      setSalvando(true)
      setErro('')

      const dados = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        tipo,
      }

      if (categoria?.id) {
        await atualizarCategoria(categoria.id, dados)
      } else {
        await criarCategoria(dados)
      }

      await aoSalvar()
      aoFechar()
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      setErro('Não foi possível salvar a categoria.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={aberto} onClose={aoFechar} fullWidth maxWidth="sm">
      <DialogTitle>
        {categoria ? 'Editar Categoria' : 'Nova Categoria'}
      </DialogTitle>

      <DialogContent>
        {erro && (
          <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
            {erro}
          </Alert>
        )}

        <FormularioCategoria
          nome={nome}
          descricao={descricao}
          tipo={tipo}
          onNomeChange={setNome}
          onDescricaoChange={setDescricao}
          onTipoChange={setTipo}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={aoFechar} disabled={salvando}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={salvarCategoria}
          disabled={salvando}
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalCategoria