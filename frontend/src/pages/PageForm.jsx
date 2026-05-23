import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function PageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState({ titulo: '', contenido: '', estado: 'borrador', descripcion: '', url_externa: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      api.get(`/pages/${id}`).then(({ data }) => {
        setForm({
          titulo: data.titulo,
          contenido: data.contenido || '',
          estado: data.estado,
          descripcion: data.descripcion || '',
          url_externa: data.url_externa || '',
        });
      });
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEditing) await api.put(`/pages/${id}`, form);
      else await api.post('/pages', form);
      navigate('/dashboard/pages');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-white transition-colors text-sm">
          ← Volver
        </button>
        <h2 className="text-2xl font-bold text-white">
          {isEditing ? 'Editar página' : 'Nueva página'}
        </h2>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
          <input type="text" required placeholder="Título de la página"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600"
            value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
          <input type="text" placeholder="Descripción corta"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600"
            value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">URL externa</label>
          <input type="url" placeholder="https://ejemplo.com/pagina"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600"
            value={form.url_externa} onChange={(e) => setForm({ ...form, url_externa: e.target.value })} />
          <p className="text-xs text-gray-600 mt-1">Opcional — si la agregas, aparecerá como enlace en la lista de páginas</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Contenido</label>
          <textarea rows={12} placeholder="Escribe el contenido aquí..."
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600 font-mono"
            value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
          <select
            className="bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            <option value="borrador">Borrador</option>
            <option value="publicado">Publicado</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
            {loading ? 'Guardando...' : isEditing ? 'Actualizar página' : 'Crear página'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
