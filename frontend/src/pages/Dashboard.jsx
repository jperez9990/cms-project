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
    className={`bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 transition-all ${onClick ? 'cursor-pointer active:scale-95 hover:border-purple-500/50 hover:bg-gray-800/50' : ''}`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${gradient}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
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

  const isOwner = (page) => page.autor_id === user.id;
  const canEdit = (page) => user.rol === 'admin' || isOwner(page);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">Bienvenido, {user?.nombre} 👋</h2>
          <p className="text-gray-500 text-sm mt-1">Panel de administración</p>
        </div>
        <button onClick={() => navigate('/dashboard/pages/new')}
          className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white px-3 py-2 rounded-xl text-sm font-medium transition-all">
          + Nueva
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon="◈" label="Páginas" value={stats.pages}
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
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
        <h3 className="font-semibold text-white mb-3 text-sm">Accesos rápidos</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/dashboard/pages/new')}
            className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all">
            + Nueva página
          </button>
          <button onClick={() => navigate('/dashboard/pages')}
            className="bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 px-3 py-2 rounded-xl text-xs font-medium transition-all">
            Ver páginas
          </button>
          {user.rol !== 'lector' && (
            <button onClick={() => navigate('/dashboard/resources')}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all">
              + Recurso
            </button>
          )}
          {user.rol === 'admin' && (
            <button onClick={() => navigate('/dashboard/users')}
              className="bg-pink-600 hover:bg-pink-500 active:scale-95 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all">
              + Usuario
            </button>
          )}
          <button onClick={() => navigate('/dashboard/profile')}
            className="bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 px-3 py-2 rounded-xl text-xs font-medium transition-all">
            Mi perfil
          </button>
        </div>
      </div>

      {/* Páginas recientes */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-white text-sm shrink-0">Páginas recientes</h3>
          <input type="text" placeholder="Buscar..."
            className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 w-full max-w-xs"
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
          <div className="divide-y divide-gray-800">
            {filteredPages.map((page) => (
              <div key={page.id} className="p-4 hover:bg-gray-800/50 active:bg-gray-800 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{page.titulo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">/{page.slug}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${estadoBadge[page.estado]}`}>
                    {page.estado}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{page.autor?.nombre}</span>
                  <span>·</span>
                  <span>{new Date(page.createdAt).toLocaleDateString('es-CO')}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {page.url_externa && (
                    <a href={page.url_externa} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-purple-400 text-xs bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                      Abrir ↗
                    </a>
                  )}
                  {canEdit(page) ? (
                    <button onClick={() => navigate(`/dashboard/pages/edit/${page.id}`)}
                      className="text-purple-400 text-xs bg-gray-800 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                      Editar
                    </button>
                  ) : (
                    <button onClick={() => navigate('/dashboard/pages')}
                      className="text-gray-400 text-xs bg-gray-800 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                      Ver todas
                    </button>
                  )}
                  <button onClick={() => navigate('/dashboard/pages')}
                    className="text-gray-500 text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                    Ver todas →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="p-4 border-t border-gray-800">
          <button onClick={() => navigate('/dashboard/pages')}
            className="text-purple-400 hover:text-purple-300 text-sm transition-colors active:scale-95">
            Ver todas las páginas →
          </button>
        </div>
      </div>
    </div>
  );
}
