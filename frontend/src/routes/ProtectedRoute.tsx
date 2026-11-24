import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function ProtectedRoute({
  admin = false,
}: {
  admin?: boolean
}) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  if (cargando) {
    return (
      <p role="status" className="py-12 text-center">
        Verificando sesion...
      </p>
    )
  }

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (admin && usuario.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
