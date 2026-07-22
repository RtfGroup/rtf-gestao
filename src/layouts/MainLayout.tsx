import logo from '../images/logo.png'
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material'

import DashboardIcon from '@mui/icons-material/Dashboard'
import InventoryIcon from '@mui/icons-material/Inventory'
import CategoryIcon from '@mui/icons-material/Category'
import PeopleIcon from '@mui/icons-material/People'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'

import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

const larguraMenu = 240

function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: larguraMenu,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: larguraMenu,
            boxSizing: 'border-box',
            background: '#0f172a',
            color: '#fff',
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 2,
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
            selected={location.pathname === '/dashboard'}
            onClick={() => navigate('/dashboard')}
          >
            <ListItemIcon sx={{ color: '#fff' }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <ListItemButton
            selected={location.pathname === '/produtos'}
            onClick={() => navigate('/produtos')}
          >
            <ListItemIcon sx={{ color: '#fff' }}>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText primary="Produtos" />
          </ListItemButton>

          <ListItemButton
            selected={location.pathname === '/categorias'}
            onClick={() => navigate('/categorias')}
          >
            <ListItemIcon sx={{ color: '#fff' }}>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary="Categorias" />
          </ListItemButton>

          <ListItemButton>
            <ListItemIcon sx={{ color: '#fff' }}>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Clientes" />
          </ListItemButton>

          <ListItemButton>
            <ListItemIcon sx={{ color: '#fff' }}>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText primary="Vendas" />
          </ListItemButton>

          <ListItemButton>
            <ListItemIcon sx={{ color: '#fff' }}>
              <AccountBalanceWalletIcon />
            </ListItemIcon>
            <ListItemText primary="Financeiro" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default MainLayout