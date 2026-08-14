import { useEffect, useState } from 'react'
import logo from '../images/logo.png'

import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'

import DashboardIcon from '@mui/icons-material/Dashboard'
import { usePeriodoDashboard } from '../contexts/PeriodoDashboardContext'
import InventoryIcon from '@mui/icons-material/Inventory'
import CategoryIcon from '@mui/icons-material/Category'
import PeopleIcon from '@mui/icons-material/People'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import FolderIcon from '@mui/icons-material/Folder'
import WarehouseIcon from '@mui/icons-material/Warehouse'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import NotificationBell from '../components/layout/NotificationBell'
import { supabase } from '../lib/supabase'

const larguraMenu = 240

function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
  mesSelecionado,
  setMesSelecionado,
  anoSelecionado,
  setAnoSelecionado,
} = usePeriodoDashboard()

  const [cadastrosAberto, setCadastrosAberto] =
    useState(true)

  const [estoqueAberto, setEstoqueAberto] =
    useState(true)

  const [financeiroAberto, setFinanceiroAberto] =
    useState(true)

  const [perfil, setPerfil] = useState('')

  const isAdmin = perfil === 'admin'

  const [empresaSelecionada, setEmpresaSelecionada] =
  useState<string | null>(null)

useEffect(() => {
  const modoEmpresa =
    localStorage.getItem('rtf_admin_modo_empresa')

  const empresaId =
    localStorage.getItem('rtf_admin_empresa_id')

  if (modoEmpresa === 'true' && empresaId) {
    setEmpresaSelecionada(empresaId)
  }
}, [])

function sairModoEmpresa() {
  localStorage.removeItem('rtf_admin_empresa_id')
  localStorage.removeItem('rtf_admin_modo_empresa')

  setEmpresaSelecionada(null)

  navigate('/admin/clientes-rtf')
}

  useEffect(() => {
    async function carregarPerfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      const { data } = await supabase
        .from('usuarios')
        .select('perfil')
        .eq('id', user.id)
        .single()

      setPerfil(data?.perfil ?? '')
    }

    void carregarPerfil()
  }, [])

if (!perfil) {
  return null
}

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <Drawer
  variant="permanent"
  sx={{
    width: larguraMenu,
    flexShrink: 0,

    '& .MuiDrawer-paper': {
      width: larguraMenu,
      boxSizing: 'border-box',

      background:
        'linear-gradient(180deg, #07111f 0%, #0b1628 45%, #101b2d 100%)',

      color: '#f8fafc',

      borderRight: '1px solid rgba(212,175,55,0.16)',

      boxShadow:
        '8px 0 30px rgba(2, 8, 23, 0.14)',

      overflowX: 'hidden',

      '&::-webkit-scrollbar': {
        width: '5px',
      },

      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },

      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(212,175,55,0.28)',
        borderRadius: '10px',
      },

      '& .MuiListItemButton-root': {
        mx: 1.2,
        my: 0.35,
        minHeight: 46,
        borderRadius: '10px',

        transition:
          'background-color 0.2s ease, transform 0.2s ease, color 0.2s ease',

        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.07)',
          transform: 'translateX(2px)',
        },

        '&.Mui-selected': {
          background:
            'linear-gradient(90deg, rgba(212,175,55,0.20), rgba(212,175,55,0.06))',

          color: '#f4c542',

          boxShadow:
            'inset 3px 0 0 #d4af37',

          '&:hover': {
            background:
              'linear-gradient(90deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08))',
          },

          '& .MuiListItemIcon-root': {
            color: '#d4af37',
          },
        },
      },

      '& .MuiListItemIcon-root': {
        minWidth: 42,
        color: '#cbd5e1',
        transition: 'color 0.2s ease',
      },

      '& .MuiListItemText-primary': {
        fontSize: '0.94rem',
        fontWeight: 500,
        letterSpacing: '0.01em',
      },
    },
  }}
>
        <Toolbar
  sx={{
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    py: 2,
    minHeight: 120,
  }}
>
  <img
    src={logo}
    alt="RTF Group"
    style={{
      width: 160,
      objectFit: 'contain',
    }}
  />
</Toolbar>
        <List>
          <ListItemButton
            selected={
              location.pathname === '/dashboard'
            }
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <ListItemIcon
              sx={{ color: '#fff' }}
            >

{isAdmin && empresaSelecionada && (
  <Box
    sx={{
      mx: 1,
      mb: 1,
      p: 1.5,
      borderRadius: 2,
      backgroundColor: '#1e293b',
    }}
  >
    <Box
      sx={{
        fontSize: 12,
        color: '#d4af37',
        fontWeight: 700,
        mb: 0.5,
      }}
    >
      MODO EMPRESA
    </Box>

    <ListItemButton
      onClick={sairModoEmpresa}
      sx={{
        p: 0,
        minHeight: 32,
      }}
    >
      <ListItemText
  primary="← Voltar para Clientes RTF"
  sx={{
    '& .MuiListItemText-primary': {
      fontSize: 13,
    },
  }}
/>
    </ListItemButton>
  </Box>
)}

              <DashboardIcon />
            </ListItemIcon>

            <ListItemText primary="Dashboard" />
          </ListItemButton>

{isAdmin && (
  <ListItemButton
    selected={
      location.pathname.startsWith(
        '/admin/clientes-rtf',
      )
    }
    onClick={() =>
      navigate('/admin/clientes-rtf')
    }
  >
    <ListItemIcon sx={{ color: '#fff' }}>
      <PeopleIcon />
    </ListItemIcon>

    <ListItemText primary="Clientes RTF" />
  </ListItemButton>
)}

          <ListItemButton
            onClick={() =>
              setCadastrosAberto(
                !cadastrosAberto,
              )
            }
          >
            <ListItemIcon
              sx={{ color: '#fff' }}
            >
              <FolderIcon />
            </ListItemIcon>

            <ListItemText primary="Cadastros" />

            {cadastrosAberto ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </ListItemButton>

          <Collapse
            in={cadastrosAberto}
            timeout="auto"
            unmountOnExit
          >
            <List
              component="div"
              disablePadding
            >
              <ListItemButton
                sx={{ pl: 4 }}
                selected={
                  location.pathname ===
                  '/produtos'
                }
                onClick={() =>
                  navigate('/produtos')
                }
              >
                <ListItemIcon
                  sx={{ color: '#fff' }}
                >
                  <InventoryIcon />
                </ListItemIcon>

                <ListItemText
                  primary="Produtos"
                />
              </ListItemButton>
                            <ListItemButton
                sx={{ pl: 4 }}
                selected={
                  location.pathname ===
                  '/categorias'
                }
                onClick={() =>
                  navigate('/categorias')
                }
              >
                <ListItemIcon
                  sx={{ color: '#fff' }}
                >
                  <CategoryIcon />
                </ListItemIcon>

                <ListItemText
                  primary="Categorias"
                />
              </ListItemButton>

              <ListItemButton
                sx={{ pl: 4 }}
                selected={
                  location.pathname ===
                  '/clientes'
                }
                onClick={() =>
                  navigate('/clientes')
                }
              >
                <ListItemIcon
                  sx={{ color: '#fff' }}
                >
                  <PeopleIcon />
                </ListItemIcon>

                <ListItemText
                  primary="Clientes"
                />
              </ListItemButton>

              <ListItemButton
                sx={{ pl: 4 }}
                selected={
                  location.pathname ===
                  '/fornecedores'
                }
                onClick={() =>
                  navigate('/fornecedores')
                }
              >
                <ListItemIcon
                  sx={{ color: '#fff' }}
                >
                  <LocalShippingIcon />
                </ListItemIcon>

                <ListItemText
                  primary="Fornecedores"
                />
              </ListItemButton>
            </List>
          </Collapse>

          <ListItemButton
            onClick={() =>
              setEstoqueAberto(
                !estoqueAberto,
              )
            }
          >
            <ListItemIcon
              sx={{ color: '#fff' }}
            >
              <WarehouseIcon />
            </ListItemIcon>

            <ListItemText primary="Estoque" />

            {estoqueAberto ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </ListItemButton>

          <Collapse
            in={estoqueAberto}
            timeout="auto"
            unmountOnExit
          >
            <List
              component="div"
              disablePadding
            >
              <ListItemButton
                sx={{ pl: 4 }}
                selected={
                  location.pathname ===
                  '/estoque'
                }
                onClick={() =>
                  navigate('/estoque')
                }
              >
                <ListItemIcon
                  sx={{ color: '#fff' }}
                >
                  <InventoryIcon />
                </ListItemIcon>

                <ListItemText
                  primary="Movimentações"
                />
              </ListItemButton>

              <ListItemButton
                sx={{ pl: 4 }}
                selected={
                  location.pathname ===
                  '/inventario'
                }
                onClick={() =>
                  navigate('/inventario')
                }
              >
                <ListItemIcon
                  sx={{ color: '#fff' }}
                >
                  <WarehouseIcon />
                </ListItemIcon>

                <ListItemText
                  primary="Inventário"
                />
              </ListItemButton>
            </List>
          </Collapse>

          <ListItemButton
            selected={
              location.pathname.startsWith(
                '/compras',
              )
            }
            onClick={() =>
              navigate('/compras')
            }
          >
            <ListItemIcon
              sx={{ color: '#fff' }}
            >
              <LocalShippingIcon />
            </ListItemIcon>

            <ListItemText primary="Compras" />
          </ListItemButton>

          <ListItemButton
            selected={
              location.pathname.startsWith(
                '/vendas',
              )
            }
            onClick={() =>
              navigate('/vendas')
            }
          >
            <ListItemIcon
              sx={{ color: '#fff' }}
            >
              <ShoppingCartIcon />
            </ListItemIcon>

            <ListItemText primary="Vendas" />
          </ListItemButton>

          <ListItemButton
            onClick={() =>
              setFinanceiroAberto(
                !financeiroAberto,
              )
            }
          >
            <ListItemIcon
              sx={{ color: '#fff' }}
            >
              <AccountBalanceWalletIcon />
            </ListItemIcon>

            <ListItemText primary="Financeiro" />

            {financeiroAberto ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </ListItemButton>

          <Collapse
  in={financeiroAberto}
  timeout="auto"
  unmountOnExit
>
  <List
    component="div"
    disablePadding
  >
    <ListItemButton
      sx={{ pl: 4 }}
      selected={location.pathname.startsWith(
        '/financeiro/contas-receber',
      )}
      onClick={() =>
        navigate(
          '/financeiro/contas-receber',
        )
      }
    >
      <ListItemIcon sx={{ color: '#fff' }}>
        <AccountBalanceWalletIcon />
      </ListItemIcon>

      <ListItemText
        primary="Contas a Receber"
      />
    </ListItemButton>

    <ListItemButton
      sx={{ pl: 4 }}
      selected={location.pathname.startsWith(
        '/financeiro/contas-pagar',
      )}
      onClick={() =>
        navigate(
          '/financeiro/contas-pagar',
        )
      }
    >
      <ListItemIcon sx={{ color: '#fff' }}>
        <AccountBalanceWalletIcon />
      </ListItemIcon>

      <ListItemText
        primary="Contas a Pagar"
      />
    </ListItemButton>
  </List>
</Collapse>
        </List>
      </Drawer>

      <Box
  component="main"
  sx={{
    flex: 1,
width: 'auto',
maxWidth: 'none',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: '100vh',
    overflowX: 'hidden',

    
background:
  'linear-gradient(135deg, #07111f 0%, #0a1628 45%, #101c2e 100%)',

'@keyframes rtfSmoke': {
  '0%': {
    transform: 'translate3d(-4%, 4%, 0) scale(1.12)',
  },

  '50%': {
    transform: 'translate3d(5%, -3%, 0) scale(1.22)',
  },

  '100%': {
    transform: 'translate3d(-2%, -7%, 0) scale(1.17)',
  },
},

'@keyframes rtfSmoke2': {
  '0%': {
    transform: 'translate3d(5%, 2%, 0) scale(1)',
  },

  '100%': {
    transform: 'translate3d(-6%, -5%, 0) scale(1.18)',
  },
},
  }}
>
        <Box
  sx={{
    height: 70,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    px: 3,

    borderBottom:
      '1px solid rgba(148,163,184,0.10)',

    background:
      'linear-gradient(90deg, #07111f 0%, #0b1628 100%)',

    position: 'sticky',
    top: 0,
    zIndex: 10,
  }}
>
          
          <Box
  sx={{
    height: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    px: 3,

    borderBottom:
      '1px solid rgba(148,163,184,0.10)',

    background:
      'linear-gradient(90deg, #07111f 0%, #0b1628 100%)',

    position: 'sticky',
    top: 0,
    zIndex: 10,
  }}
>
 {/* SAUDAÇÃO */}
<Box
  sx={{
    lineHeight: 1.15,
    flexShrink: 0,
    mr: 'auto',
    ml: -3,
  }}
>
    <Typography
      sx={{
        color: '#fff',
        fontWeight: 800,
        fontSize: 25,
        whiteSpace: 'nowrap',
        letterSpacing: '-0.02em',
      }}
    >
      {Number(
        new Intl.DateTimeFormat('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          hour: '2-digit',
          hour12: false,
        }).format(new Date()),
      ) < 12
        ? 'Bom dia'
        : Number(
            new Intl.DateTimeFormat('pt-BR', {
              timeZone: 'America/Sao_Paulo',
              hour: '2-digit',
              hour12: false,
            }).format(new Date()),
          ) < 18
        ? 'Boa tarde'
        : 'Boa noite'} 👋
    </Typography>

    <Typography
      sx={{
        color: '#94a3b8',
        fontSize: 13,
        whiteSpace: 'nowrap',
      }}
    >
      {new Date().toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      })}{' '}
•{' '}
{new Date().toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
      })}
    </Typography>
  </Box>

  {/* PERÍODO + NOTIFICAÇÕES */}
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 1.5,
      ml: 'auto',

      '& .MuiOutlinedInput-root': {
        height: 46,
        color: '#f8fafc',
        backgroundColor: 'rgba(8,20,38,0.85)',
        borderRadius: '10px',

        '& fieldset': {
          borderColor: 'rgba(148,163,184,0.18)',
        },

        '&:hover fieldset': {
          borderColor: 'rgba(212,175,55,0.40)',
        },

        '&.Mui-focused fieldset': {
          borderColor: '#d4af37',
        },
      },

      '& .MuiInputLabel-root': {
        color: '#94a3b8',
      },

      '& .MuiSvgIcon-root': {
        color: '#d4af37',
      },
    }}
  >
    <TextField
      select
      size="small"
      label="Mês"
      value={mesSelecionado}
      onChange={(event) =>
        setMesSelecionado(
          Number(event.target.value),
        )
      }
      sx={{
  width: 100,
  lineHeight: 1.15,
  flexShrink: 0,
  mr: 'auto',
  ml: 98,
}}
>
      {[
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ].map((mes, index) => (
        <MenuItem
          key={mes}
          value={index}
        >
          {mes}
        </MenuItem>
      ))}
    </TextField>

    <TextField
      select
      size="small"
      label="Ano"
      value={anoSelecionado}
      onChange={(event) =>
        setAnoSelecionado(
          Number(event.target.value),
        )
      }
      sx={{ width: 100 }}
    >
      {[2025, 2026, 2027, 2028].map(
        (ano) => (
          <MenuItem
            key={ano}
            value={ano}
          >
            {ano}
          </MenuItem>
        ),
      )}
    </TextField>

    <NotificationBell />
  </Box>
</Box>


        </Box>

        <Box
  sx={{
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    m: 0,
    p: 0,
    overflowX: 'hidden',

    position: 'relative',
zIndex: 1,
  }}
>
  <Outlet />
</Box>
      </Box>
    </Box>
  )
}

export default MainLayout