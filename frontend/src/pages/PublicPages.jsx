import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

function PageModal({ page, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-white font-bold text-xl">{page.titulo}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl ml-4">✕</button>
        </div>
        {page.descripcion && (
          <p className="text-gray-400 text-sm mb-4 bg-gray-800 rounded-xl px-4 py-3">{page.descripcion}</p>
        )}
        {page.contenido && (
          <div className="text-gray-300 text-sm mb-4 bg-gray-800 rounded-xl px-4 py-3 max-h-60 overflow-y-auto">
            <p className="whitespace-pre-wrap">{page.contenido}</p>
          </div>
        )}
        {page.url_externa && (
          <a href={page.url_externa} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2.5 w-full justify-center mb-3 transition-colors">
            Abrir enlace externo ↗
          </a>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-800">
          <span>por {page.autor?.nombre}</span>
          <span>{new Date(page.createdAt).toLocaleDateString('es-CO')}</span>
        </div>
      </div>
    </div>
  );
}

export default function PublicPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPage, setSelectedPage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${BASE_URL}/public/pages`)
      .then(({ data }) => { setPages(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = pages.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {selectedPage && (
        <PageModal page={selectedPage} onClose={() => setSelectedPage(null)} />
      )}

      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">✦</div>
            <h1 className="text-white font-bold text-lg">CMS Panel</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/login')}
              className="text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              Iniciar sesión
            </button>
            <button onClick={() => navigate('/register')}
              className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              Registrarse
            </button>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-br from-purple-900/30 via-gray-950 to-indigo-900/20 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Contenido publicado</h2>
          <p className="text-gray-400 mb-6">Explora las páginas disponibles. Inicia sesión para crear tu propio contenido.</p>
          <div className="max-w-md mx-auto">
            <input type="text" placeholder="Buscar páginas..."
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="text-5xl mb-4">◈</p>
            <p className="text-lg">No hay páginas publicadas todavía</p>
            <button onClick={() => navigate('/register')}
              className="mt-4 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Regístrate y publica →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((page) => (
              <div key={page.id} onClick={() => setSelectedPage(page)}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 cursor-pointer hover:border-purple-500/40 hover:bg-gray-800/50 active:scale-95 transition-all">
                <h3 className="text-white font-semibold text-lg mb-2">{page.titulo}</h3>
                {page.descripcion && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{page.descripcion}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>por {page.autor?.nombre}</span>
                  <span>{new Date(page.createdAt).toLocaleDateString('es-CO')}</span>
                </div>
                {page.url_externa && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <a href={page.url_externa} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-purple-400 hover:text-purple-300 text-xs transition-colors">
                      Ver enlace ↗
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 rounded-2xl p-6 text-center">
          <p className="text-white font-semibold mb-2">¿Quieres publicar tu propio contenido?</p>
          <p className="text-gray-400 text-sm mb-4">Crea una cuenta gratis y empieza a gestionar tus páginas.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/register')}
              className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Crear cuenta
            </button>
            <button onClick={() => navigate('/login')}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
