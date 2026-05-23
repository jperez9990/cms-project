import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const estadoBadge = {
  publicado: 'bg-green-500/10 text-green-400 border border-green-500/20',
  borrador: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  archivado: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
};

const estadoOpciones = ['borrador', 'publicado', 'archivado'];

function PageModal({ page, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-xl">{page.titulo}</h3>
            <p className="text-gray-500 text-xs mt-1">/{page.slug}</p>
          </div>
          <button onClick={onClose}
            className="text-gray-500 hover:text-white text-xl transition-colors ml-4">✕</button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${estadoBadge[page.estado]}`}>
            {page.estado}
          </span>
          <span className="text-gray-500 text-xs">por {page.autor?.nombre}</span>
          <span className="text-gray-600 text-xs">
            {new Date(page.createdAt).toLocaleDateString('es-CO')}
          </span>
        </div>

        {page.descripcion && (
          <p className="text-gray-400 text-sm mb-4 bg-gray-800 rounded-xl px-4 py-3">
            {page.descripcion}
          </p>
        )}

        {page.contenido && (
          <div className="text-gray-300 text-sm mb-4 bg-gray-800 rounded-xl px-4 py-3 max-h-48 overflow-y-auto">
            <p className="whitespace-pre-wrap">{page.contenido}</p>
          </div>
        )}

        {page.url_externa && (
          <a href={page.url_externa} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2.5 w-full justify-center">
            Abrir enlace externo ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default function Pages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPage, setSelectedPage] = useState(null);
  const [changingEstado, setChangingEstado] = useState(null);
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
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const changeEstado = async (page, nuevoEstado) => {
    setChangingEstado(page.id);
    try {
      await api.put(`/pages/${page.id}`, { estado: nuevoEstado });
      setPages((prev) => prev.map((p) =>
        p.id === page.id ? { ...p, estado: nuevoEstado } : p
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar estado');
    } finally {
      setChangingEstado(null);
    }
  };

  const isOwner = (page) => page.autor_id === user.id;
  const canEdit = (page) => user.rol === 'admin' || isOwner(page);
  const canDelete = (page) => user.rol === 'admin' || isOwner(page);
  const canChangeEstado = (page) => user.rol === 'admin' || isOwner(page);

  const filtered = pages.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {selectedPage && (
        <PageModal page={selectedPage} onClose={() => setSelectedPage(null)} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Páginas</h2>
          <p className="text-gray-500 text-sm mt-1">{pages.length} páginas en total</p>
        </div>
        <button onClick={() => navigate('/dashboard/pages/new')}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Nueva página
        </button>
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
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((page) => (
                <tr key={page.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => !canEdit(page) && setSelectedPage(page)}
                      className={`text-left ${!canEdit(page) ? 'cursor-pointer hover:text-purple-300' : 'cursor-default'}`}
                    >
                      <p className="font-medium text-white">{page.titulo}</p>
                      <p className="text-xs text-gray-500 mt-0.5">/{page.slug}</p>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {canChangeEstado(page) ? (
                      <select
                        value={page.estado}
                        disabled={changingEstado === page.id}
                        onChange={(e) => changeEstado(page, e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                      >
                        {estadoOpciones.map((op) => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${estadoBadge[page.estado]}`}>
                        {page.estado}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{page.autor?.nombre || '—'}</td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center">
                      {canEdit(page) ? (
                        <button onClick={() => navigate(`/dashboard/pages/edit/${page.id}`)}
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                          Editar
                        </button>
                      ) : (
                        <button onClick={() => setSelectedPage(page)}
                          className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors">
                          Ver
                        </button>
                      )}
                      {canDelete(page) && (
                        <button onClick={() => deletePage(page.id)}
                          className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors">
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
