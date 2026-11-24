import { Routes, Route, Link, Navigate } from 'react-router-dom'

import { MainLayout } from '../shared/layout/MainLayout'
import { AdminLayout } from '../shared/layout/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'

import { CatalogoPage } from '../features/productos/CatalogoPage'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { CarritoPage } from '../features/pedidos/CarritoPage'
import { CheckoutPage } from '../features/pedidos/CheckoutPage'
import { MisPedidosPage } from '../features/pedidos/MisPedidosPage'

import { AdminResumenPage } from '../features/pedidos/AdminResumenPage'
import { AdminCategoriasPage } from '../features/categorias/AdminCategoriasPage'
import { AdminProductosPage } from '../features/productos/AdminProductosPage'
import { AdminPedidosPage } from '../features/pedidos/AdminPedidosPage'
import { AdminUsuariosPage } from '../features/usuarios/AdminUsuariosPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<CatalogoPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="carrito" element={<CarritoPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="mis-pedidos" element={<MisPedidosPage />} />
        </Route>

        <Route element={<ProtectedRoute admin />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="resumen" replace />} />

            <Route path="resumen" element={<AdminResumenPage />} />
            <Route path="categorias" element={<AdminCategoriasPage />} />
            <Route path="productos" element={<AdminProductosPage />} />
            <Route path="pedidos" element={<AdminPedidosPage />} />
            <Route path="usuarios" element={<AdminUsuariosPage />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <div className="panel text-center">
              <h1 className="text-2xl font-bold">
                Pagina no encontrada
              </h1>

              <Link to="/" className="btn mt-4">
                Volver al inicio
              </Link>
            </div>
          }
        />
      </Route>
    </Routes>
  )
}
