import {
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

export interface ProdutoEstoqueBaixo {
  id: string
  nome: string
  categoria: string
  quantidade: number
  minimo: number
}

interface Props {
  produtos: ProdutoEstoqueBaixo[]
  carregando: boolean
}

export default function EstoqueBaixo({
  produtos,
  carregando,
}: Props) {
  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography
        variant="h6"
        sx={{
          px: 2,
          pt: 2,
          pb: 1,
          fontWeight: 700,
        }}
      >
        Produtos com Estoque Baixo
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Produto</strong>
            </TableCell>

            <TableCell>
              <strong>Categoria</strong>
            </TableCell>

            <TableCell align="center">
              <strong>Atual</strong>
            </TableCell>

            <TableCell align="center">
              <strong>Mínimo</strong>
            </TableCell>

            <TableCell align="center">
              <strong>Status</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {carregando ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <CircularProgress size={28} />
              </TableCell>
            </TableRow>
          ) : produtos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Nenhum produto com estoque baixo.
              </TableCell>
            </TableRow>
          ) : (
            produtos.map((produto) => (
              <TableRow key={produto.id} hover>
                <TableCell>{produto.nome}</TableCell>

                <TableCell>{produto.categoria}</TableCell>

                <TableCell align="center">
                  {produto.quantidade}
                </TableCell>

                <TableCell align="center">
                  {produto.minimo}
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label="Baixo"
                    color="warning"
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}