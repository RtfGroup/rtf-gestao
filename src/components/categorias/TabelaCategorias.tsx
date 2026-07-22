import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'

export type Categoria = {
  id?: string
  nome?: string
  descricao?: string
  tipo?: string
}

type TabelaCategoriasProps = {
  categorias: Categoria[]
  aoEditar: (categoria: Categoria) => void
  aoExcluir: (categoria: Categoria) => void
}

function TabelaCategorias({
  categorias,
  aoEditar,
  aoExcluir,
}: TabelaCategoriasProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {categorias.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography color="text.secondary">
                  Nenhuma categoria cadastrada.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            categorias.map((categoria) => (
              <TableRow key={categoria.id}>
                <TableCell>{categoria.nome ?? '-'}</TableCell>
                <TableCell>{categoria.descricao ?? '-'}</TableCell>
                <TableCell>{categoria.tipo ?? '-'}</TableCell>

                <TableCell>
                  <Tooltip title="Editar categoria">
                    <IconButton
                      onClick={() => aoEditar(categoria)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Excluir categoria">
                    <IconButton
                      onClick={() => aoExcluir(categoria)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default TabelaCategorias