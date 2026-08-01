import { useState } from 'react'
import logo from '../images/logo.png'

import {
  Box,
  Collapse,
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

const larguraMenu = 240

function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [cadastrosAberto, setCadastrosAberto] = useState(true)
  const [estoqueAberto, setEstoqueAberto] = useState(true)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
            onClick={() => setCadastrosAberto(!cadastrosAberto)}
          >
            <ListItemIcon sx={{ color: '#fff' }}>
              <FolderIcon />
            </ListItemIcon>

            <ListItemText primary="Cadastros" />

            {cadastrosAberto ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </ListItemButton>

          <Collapse in={cadastrosAberto} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={location.pathname === '/produtos'}
                onClick={() => navigate('/produtos')}
              >
                <ListItemIcon sx={{ color: '#fff' }}>
                  <InventoryIcon />
                </ListItemIcon>

                <ListItemText primary="Produtos" />
              </ListItemButton>

              <ListItemButton
                sx={{ pl: 4 }}
                selected={location.pathname === '/categorias'}
                onClick={() => navigate('/categorias')}
              >
                <ListItemIcon sx={{ color: '#fff' }}>
                  <CategoryIcon />
                </ListItemIcon>

                <ListItemText primary="Categorias" />
              </ListItemButton>

              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon sx={{ color: '#fff' }}>
                  <PeopleIcon />
                </ListItemIcon>

                <ListItemText primary="Clientes" />
              </ListItemButton>

              <ListItemButton
                sx={{ pl: 4 }}
                selected={location.pathname === '/fornecedores'}
                onClick={() => navigate('/fornecedores')}
              >
                <ListItemIcon sx={{ color: '#fff' }}>
                  <LocalShippingIcon />
                </ListItemIcon>

                <ListItemText primary="Fornecedores" />
              </ListItemButton>
            </List>
          </Collapse>

          <ListItemButton
            onClick={() => setEstoqueAberto(!estoqueAberto)}
          >
            <ListItemIcon sx={{ color: '#fff' }}>
              <WarehouseIcon />
            </ListItemIcon>

            <ListItemText primary="Estoque" />

            {estoqueAberto ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </ListItemButton>

          <Collapse in={estoqueAberto} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                selected={location.pathname === '/estoque'}
                onClick={() => navigate('/estoque')}
              >
                <ListItemIcon sx={{ color: '#fff' }}>
                  <InventoryIcon />
                </ListItemIcon>

                <ListItemText primary="Movimentações" />
              </ListItemButton>

              <ListItemButton
                sx={{ pl: 4 }}
                selected={location.pathname === '/inventario'}
                onClick={() => navigate('/inventario')}
              >
                <ListItemIcon sx={{ color: '#fff' }}>
                  <WarehouseIcon />
                </ListItemIcon>

                <ListItemText primary="Inventário" />
              </ListItemButton>
            </List>
          </Collapse>

          <ListItemButton
            selected={location.pathname.startsWith('/compras')}
            onClick={() => navigate('/compras')}
          >
            <ListItemIcon sx={{ color: '#fff' }}>
              <LocalShippingIcon />
            </ListItemIcon>

            <ListItemText primary="Compras" />
          </ListItemButton>

          <ListItemButton
            selected={location.pathname.startsWith('/vendas')}
            onClick={() => navigate('/vendas')}
          >
            <ListItemIcon sx={{ color: '#fff' }}>
              <ShoppingCartIcon />
            </ListItemIcon>

            <ListItemText primary="Vendas" />
          </ListItemButton>

          <ListItemButton
            selected={location.pathname.startsWith('/financeiro')}
            onClick={() => navigate('/financeiro/contas-receber')}
          >
            <ListItemIcon sx={{ color: '#fff' }}>
              <AccountBalanceWalletIcon />
            </ListItemIcon>

            <ListItemText primary="Financeiro" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
        }}
      >
        <Box
          sx={{
            height: 70,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            px: 3,
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <NotificationBell />
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 4,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default MainLayout