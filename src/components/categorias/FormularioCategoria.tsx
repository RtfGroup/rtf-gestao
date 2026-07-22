import {
  Grid,
  MenuItem,
  TextField,
} from '@mui/material'

type Props = {
  nome: string
  descricao: string
  tipo: string
  onNomeChange: (value: string) => void
  onDescricaoChange: (value: string) => void
  onTipoChange: (value: string) => void
}

function FormularioCategoria({
  nome,
  descricao,
  tipo,
  onNomeChange,
  onDescricaoChange,
  onTipoChange,
}: Props) {
  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Nome"
          value={nome}
          onChange={(e) => onNomeChange(e.target.value)}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Descrição"
          value={descricao}
          onChange={(e) => onDescricaoChange(e.target.value)}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          select
          fullWidth
          label="Tipo"
          value={tipo}
          onChange={(e) => onTipoChange(e.target.value)}
        >
          <MenuItem value="produto">Produto</MenuItem>
          <MenuItem value="servico">Serviço</MenuItem>
          <MenuItem value="receita">Receita</MenuItem>
          <MenuItem value="despesa">Despesa</MenuItem>
          <MenuItem value="outro">Outro</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  )
}

export default FormularioCategoria