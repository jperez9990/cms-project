import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatBytes = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const { user } = useAuth();

  const fetchResources = async () => {
    try {
      const { data } = await api.get('/resources');
      setResources(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchResources(); }, []);

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/resources/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const deleteResource = async (id) => {
    if (!window.confirm('¿Eliminar este recurso?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch { alert('Error al eliminar'); }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    alert('URL copiada al portapapeles');
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recursos</h2>
        <p className="text-gray-500 text-sm mt-1">{resources.length} archivos subidos</p>
      </div>
      {user.rol !== 'lector' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-6 ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => uploadFile(e.target.files[0])} />
          {uploading ? (
            <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div></div>
          ) : (
            <>
              <p className="text-4xl mb-2">📁</p>
              <p className="text-gray-600 font-medium">Arrastra un archivo aquí o haz clic para seleccionar</p>
              <p className="text-gray-400 text-sm mt-1">Imágenes, PDFs, videos — máximo 10MB</p>
            </>
          )}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl shadow-sm">
          <p className="text-4xl mb-2">🖼️</p>
          <p>No hay recursos subidos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {resources.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                {r.tipo?.startsWith('image/') ? (
                  <img src={r.url} alt={r.nombre_original} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-5xl">
                    {r.tipo?.includes('pdf') ? '📕' : r.tipo?.includes('video') ? '🎬' : '📎'}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-700 truncate">{r.nombre_original}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatBytes(r.tamaño)}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => copyUrl(r.url)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Copiar URL</button>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-700 font-medium">Ver</a>
                  {user.rol === 'admin' && (
                    <button onClick={() => deleteResource(r.id)} className="text-xs text-red-500 hover:text-red-700 font-medium ml-auto">Eliminar</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
