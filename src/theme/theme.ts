import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#D4A63A',
      contrastText: '#0F172A',
    },
    secondary: {
      main: '#0F172A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    success: {
      main: '#16A34A',
    },
    error: {
      main: '#DC2626',
    },
  },

  typography: {
    fontFamily: 'Poppins, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 10,
  },
})

export default theme