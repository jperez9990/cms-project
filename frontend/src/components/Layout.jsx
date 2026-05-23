import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞', roles: ['admin', 'editor', 'lector'] },
  { to: '/dashboard/pages', label: 'Páginas', icon: '◈', roles: ['admin', 'editor', 'lector'] },
  { to: '/dashboard/resources', label: 'Recursos', icon: '◉', roles: ['admin', 'editor'] },
  { to: '/dashboard/users', label: 'Usuarios', icon: '◎', roles: ['admin'] },
  { to: '/dashboard/config', label: 'Configuración', icon: '◌', roles: ['admin'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const visibleItems = navItems.filter((i) => i.roles.includes(user?.rol));

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">✦</div>
            <h1 className="text-white font-bold text-lg">CMS Panel</h1>
          </div>
          <div className="bg-gray-800 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.nombre}</p>
                <span className="text-xs text-purple-400 capitalize">{user?.rol}</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150">
            <span>⊗</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-gray-950">
        {children}
      </main>
    </div>
  );
}
