import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['admin', 'editor', 'lector'] },
  { to: '/dashboard/pages', label: 'Páginas', icon: '📄', roles: ['admin', 'editor'] },
  { to: '/dashboard/resources', label: 'Recursos', icon: '🖼️', roles: ['admin', 'editor'] },
  { to: '/dashboard/users', label: 'Usuarios', icon: '👥', roles: ['admin'] },
  { to: '/dashboard/config', label: 'Configuración', icon: '⚙️', roles: ['admin'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const visibleItems = navItems.filter((i) => i.roles.includes(user?.rol));

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-xl font-bold">CMS Panel</h1>
          <p className="text-blue-300 text-sm mt-1 truncate">{user?.nombre}</p>
          <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full capitalize">{user?.rol}</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
