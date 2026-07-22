import EditIcon from '@mui/icons-material/Edit'
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

export type Produto = {
  id?: string
  codigo?: string
  nome?: string
  descricao?: string
  categoria?: string
  estoque?: number
  preco_venda?: number
}

type TabelaProdutosProps = {
  produtos: Produto[]
  aoEditar: (produto: Produto) => void
}

function TabelaProdutos({
  produtos,
  aoEditar,
}: TabelaProdutosProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Código</TableCell>
            <TableCell>Produto</TableCell>
            <TableCell>Categoria</TableCell>
            <TableCell>Estoque</TableCell>
            <TableCell>Preço de venda</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {produtos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography color="text.secondary">
                  Nenhum produto cadastrado.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            produtos.map((produto) => (
              <TableRow key={produto.id ?? produto.codigo}>
                <TableCell>{produto.codigo ?? '-'}</TableCell>
                <TableCell>{produto.nome ?? '-'}</TableCell>
                <TableCell>{produto.categoria ?? '-'}</TableCell>
                <TableCell>{produto.estoque ?? 0}</TableCell>

                <TableCell>
                  {Number(produto.preco_venda ?? 0).toLocaleString(
                    'pt-BR',
                    {
                      style: 'currency',
                      currency: 'BRL',
                    },
                  )}
                </TableCell>

                <TableCell>
                  <Tooltip title="Editar produto">
                    <IconButton
                      onClick={() => aoEditar(produto)}
                      aria-label="Editar produto"
                    >
                      <EditIcon />
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

export default TabelaProdutos