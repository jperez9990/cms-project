import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const estadoBadge = {
  publicado: 'bg-green-500/10 text-green-400 border border-green-500/20',
  borrador: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  archivado: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
};

export default function Pages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPages = async () => {
    try {
      const { data } = await api.get('/pages');
      setPages(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPages(); }, []);

  const deletePage = async (id) => {
    if (!window.confirm('¿Eliminar esta página?')) return;
    try {
      await api.delete(`/pages/${id}`);
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch { alert('Error al eliminar'); }
  };

  const filtered = pages.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Páginas</h2>
          <p className="text-gray-500 text-sm mt-1">{pages.length} páginas en total</p>
        </div>
        {user.rol !== 'lector' && (
          <button onClick={() => navigate('/dashboard/pages/new')}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            + Nueva página
          </button>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <input type="text" placeholder="Buscar páginas..."
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-4xl mb-2">◈</p>
            <p>No hay páginas todavía</p>
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
                {user.rol !== 'lector' && <th className="px-6 py-3">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((page) => (
                <tr key={page.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
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
                  <td className="px-6 py-4">
                    {page.url_externa ? (
                      <a href={page.url_externa} target="_blank" rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 text-xs underline underline-offset-2 transition-colors">
                        {page.url_externa.length > 30 ? page.url_externa.substring(0, 30) + '...' : page.url_externa}
                      </a>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(page.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  {user.rol !== 'lector' && (
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button onClick={() => navigate(`/dashboard/pages/edit/${page.id}`)}
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                          Editar
                        </button>
                        {user.rol === 'admin' && (
                          <button onClick={() => deletePage(page.id)}
                            className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors">
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
