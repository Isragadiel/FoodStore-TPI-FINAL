import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { handleApiError } from '../api/handleApiError'

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) =>
    s.items.reduce((total, item) => total + item.cantidad, 0),
  )

  const navigate = useNavigate()
  const [error, setError] = useState('')

  async function salir() {
    try {
      setError('')
      await logout()
      navigate('/login')
    } catch (e) {
      setError(handleApiError(e))
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="text-2xl font-black text-orange-600">
          Food Store
        </Link>

        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
          <Link to="/">Catalogo</Link>
          <Link to="/carrito">Carrito ({cantidad})</Link>

          {usuario ? (
            <>
              <Link to="/mis-pedidos">Mis pedidos</Link>

              {usuario.role === 'admin' && (
                <Link to="/admin/resumen" className="text-orange-600">
                  Administracion
                </Link>
              )}

              <span className="text-slate-500">
                {usuario.full_name}
              </span>

              <button className="btn-secondary" onClick={salir}>
                Cerrar sesion
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Ingresar</Link>
              <Link to="/register" className="btn">
                Registrarme
              </Link>
            </>
          )}
        </div>
      </nav>

      {error && <p role="alert" className="p-2 text-center text-red-600">{error}</p>}
    </header>
  )
}
