import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const estadoBadge = {
  publicado: 'bg-green-100 text-green-700',
  borrador: 'bg-yellow-100 text-yellow-700',
  archivado: 'bg-gray-100 text-gray-600'
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
          <h2 className="text-2xl font-bold text-gray-800">Páginas</h2>
          <p className="text-gray-500 text-sm mt-1">{pages.length} páginas en total</p>
        </div>
        {user.rol !== 'lector' && (
          <button onClick={() => navigate('/dashboard/pages/new')}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors">
            + Nueva página
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <input type="text" placeholder="Buscar páginas..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📄</p>
            <p>No hay páginas todavía</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b">
                <th className="px-6 py-3">Título</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Autor</th>
                <th className="px-6 py-3">Fecha</th>
                {user.rol !== 'lector' && <th className="px-6 py-3">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((page) => (
                <tr key={page.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{page.titulo}</p>
                    <p className="text-xs text-gray-400">/{page.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${estadoBadge[page.estado]}`}>
                      {page.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{page.autor?.nombre || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(page.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  {user.rol !== 'lector' && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/dashboard/pages/edit/${page.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Editar
                        </button>
                        {user.rol === 'admin' && (
                          <button onClick={() => deletePage(page.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium">
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
