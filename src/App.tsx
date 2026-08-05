import { useEffect, useState } from 'react'

import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'

import { supabase } from './lib/supabase'

import MainLayout from './layouts/MainLayout'

import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'
import Categorias from './pages/Categorias'
import Compras from './pages/Compras'
import NovaCompra from './pages/NovaCompra'
import EditarCompra from './pages/EditarCompra'
import DetalhesCompra from './pages/DetalhesCompra'
import Fornecedores from './pages/Fornecedores'
import Login from './pages/Login'
import Inventario from './pages/Inventario'
import Clientes from './pages/Clientes'
import NovaVenda from './pages/NovaVenda'
import Vendas from './pages/Vendas'
import DetalhesVenda from './pages/DetalhesVenda'
import EditarVenda from './pages/EditarVenda'
import ContasReceber from './pages/ContasReceber'
import ContasPagar from './pages/ContasPagar'
import DetalhesContaReceber from './pages/DetalhesContaReceber'
import EditarContaReceber from './pages/EditarContaReceber'
import DetalhesContaPagar from './pages/DetalhesContaPagar'
import EditarContaPagar from './pages/EditarContaPagar'
import PagarConta from './pages/PagarConta'

function RotaProtegida() {
  const [carregando, setCarregando] = useState(true)
  const [autenticado, setAutenticado] = useState(false)

  useEffect(() => {
    async function verificarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setAutenticado(Boolean(session))
      setCarregando(false)
    }

    void verificarSessao()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      setAutenticado(Boolean(session))
      setCarregando(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (carregando) {
    return <div>Carregando...</div>
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<RotaProtegida />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/produtos" element={<Produtos />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route
              path="/fornecedores"
              element={<Fornecedores />}
            />

            <Route path="/compras" element={<Compras />} />
            <Route path="/compras/nova" element={<NovaCompra />} />
            <Route
              path="/compras/:id"
              element={<DetalhesCompra />}
            />
            <Route
              path="/compras/:id/editar"
              element={<EditarCompra />}
            />

            <Route path="/inventario" element={<Inventario />} />

            <Route path="/vendas" element={<Vendas />} />
            <Route path="/vendas/nova" element={<NovaVenda />} />
            <Route
              path="/vendas/:id"
              element={<DetalhesVenda />}
            />
            <Route
              path="/vendas/:id/editar"
              element={<EditarVenda />}
            />

            <Route
              path="/financeiro/contas-receber"
              element={<ContasReceber />}
            />

            <Route
  path="/financeiro/contas-pagar"
  element={<ContasPagar />}
/>

<Route
  path="/financeiro/contas-pagar/:id"
  element={<DetalhesContaPagar />}
/>

<Route
  path="/financeiro/contas-pagar/:id/editar"
  element={<EditarContaPagar />}
/>

<Route
  path="/financeiro/contas-pagar/:id/pagar"
  element={<PagarConta />}
/>

            <Route
              path="/financeiro/contas-receber/:id"
              element={<DetalhesContaReceber />}
            />
            <Route
              path="/financeiro/contas-receber/:id/editar"
              element={<EditarContaReceber />}
            />
          </Route>
        </Route>

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App