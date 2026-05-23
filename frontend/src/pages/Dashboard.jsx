import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const estadoBadge = {
  publicado: 'bg-green-500/10 text-green-400 border border-green-500/20',
  borrador: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  archivado: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
};

const StatCard = ({ icon, label, value, gradient, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-4 transition-all ${onClick ? 'cursor-pointer hover:border-purple-500/50 hover:bg-gray-800/50' : ''}`}
  >
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${gradient}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pages: null, users: null, resources: null, published: null });
  const [recentPages, setRecentPages] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pagesRes, resourcesRes] = await Promise.all([
          api.get('/pages'),
          api.get('/resources'),
        ]);
        const pages = pagesRes.data;
        const published = pages.filter((p) => p.estado === 'publicado').length;
        setStats((s) => ({ ...s, pages: pages.length, published, resources: resourcesRes.data.length }));
        setRecentPages(pages.slice(0, 5));
        if (user.rol === 'admin') {
          const usersRes = await api.get('/users');
          setStats((s) => ({ ...s, users: usersRes.data.length }));
        }
      } catch {}
    };
    fetchStats();
  }, [user.rol]);

  const filteredPages = recentPages.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Bienvenido, {user?.nombre} 👋</h2>
          <p className="text-gray-500 mt-1">Panel de administración del CMS</p>
        </div>
        <button onClick={() => navigate('/dashboard/pages/new')}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Nueva página
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon="◈" label="Total Páginas" value={stats.pages}
          gradient="bg-purple-500/10 text-purple-400"
          onClick={() => navigate('/dashboard/pages')} />
        <StatCard icon="✦" label="Publicadas" value={stats.published}
          gradient="bg-green-500/10 text-green-400"
          onClick={() => navigate('/dashboard/pages')} />
        <StatCard icon="◉" label="Recursos" value={stats.resources}
          gradient="bg-indigo-500/10 text-indigo-400"
          onClick={() => user.rol !== 'lector' && navigate('/dashboard/resources')} />
        {user.rol === 'admin' && (
          <StatCard icon="◎" label="Usuarios" value={stats.users}
            gradient="bg-pink-500/10 text-pink-400"
            onClick={() => navigate('/dashboard/users')} />
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-white mb-4">Accesos rápidos</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/dashboard/pages/new')}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            + Nueva página
          </button>
          <button onClick={() => navigate('/dashboard/pages')}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            Ver páginas
          </button>
          {user.rol !== 'lector' && (
            <button onClick={() => navigate('/dashboard/resources')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              + Subir recurso
            </button>
          )}
          {user.rol === 'admin' && (
            <button onClick={() => navigate('/dashboard/users')}
              className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              + Nuevo usuario
            </button>
          )}
          <button onClick={() => navigate('/dashboard/profile')}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            Mi perfil
          </button>
        </div>
      </div>

      {/* Páginas recientes */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-4">
          <h3 className="font-semibold text-white">Páginas recientes</h3>
          <input type="text" placeholder="Buscar..."
            className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 w-64"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {filteredPages.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <p className="text-3xl mb-2">◈</p>
            <p className="text-sm">No hay páginas todavía</p>
            <button onClick={() => navigate('/dashboard/pages/new')}
              className="mt-3 text-purple-400 hover:text-purple-300 text-sm transition-colors">
              Crear primera página →
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-800">
                <th className="px-6 py-3">Título</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Autor</th>
                <th className="px-6 py-3">URL</th>
                <th className="px-6 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((page) => (
                <tr key={page.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/pages/edit/${page.id}`)}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{page.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">/{page.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${estadoBadge[page.estado]}`}>
                      {page.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{page.autor?.nombre || '—'}</td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    {page.url_externa ? (
                      <a href={page.url_externa} target="_blank" rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 text-xs underline underline-offset-2 transition-colors">
                        Abrir ↗
                      </a>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(page.createdAt).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="p-4 border-t border-gray-800">
          <button onClick={() => navigate('/dashboard/pages')}
            className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
            Ver todas las páginas →
          </button>
        </div>
      </div>
    </div>
  );
}
