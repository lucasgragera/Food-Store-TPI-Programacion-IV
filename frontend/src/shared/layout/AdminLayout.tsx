import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/admin/resumen', label: 'Resumen' },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/usuarios', label: 'Usuarios' },
]

export function AdminLayout() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm font-medium ${
                isActive ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
