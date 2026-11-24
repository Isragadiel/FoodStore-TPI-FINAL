import { NavLink, Outlet } from 'react-router-dom'

const enlaces = [
  ['resumen', 'Resumen'],
  ['categorias', 'Categorias'],
  ['productos', 'Productos'],
  ['pedidos', 'Pedidos'],
  ['usuarios', 'Usuarios'],
]

export function AdminLayout() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel administrativo</h1>

      <nav className="flex flex-wrap gap-2">
        {enlaces.map(([ruta, nombre]) => (
          <NavLink
            key={ruta}
            to={`/admin/${ruta}`}
            className={({ isActive }) =>
              isActive ? 'btn' : 'btn-secondary'
            }
          >
            {nombre}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
