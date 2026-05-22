import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Config() {
  const [config, setConfig] = useState({ site_name: '', site_description: '', site_color: '#1F497D' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/config').then(({ data }) => {
      setConfig((prev) => ({ ...prev, ...data }));
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/config', config);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {}
    setSaving(false);
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Configuración del sitio</h2>
        <p className="text-gray-500 text-sm mt-1">Personaliza la información general del sitio</p>
      </div>
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          ✅ Configuración guardada correctamente
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del sitio</label>
          <input type="text" placeholder="Mi CMS"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={config.site_name} onChange={(e) => setConfig({ ...config, site_name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea rows={3} placeholder="Descripción del sitio"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={config.site_description} onChange={(e) => setConfig({ ...config, site_description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color primario</label>
          <div className="flex items-center gap-3">
            <input type="color" className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
              value={config.site_color} onChange={(e) => setConfig({ ...config, site_color: e.target.value })} />
            <span className="text-sm text-gray-500 font-mono">{config.site_color}</span>
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </form>
    </div>
  );
}
