import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
    <div className={`text-4xl p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value ?? '—'}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pages: null, users: null, resources: null, published: null });

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
        if (user.rol === 'admin') {
          const usersRes = await api.get('/users');
          setStats((s) => ({ ...s, users: usersRes.data.length }));
        }
      } catch {}
    };
    fetchStats();
  }, [user.rol]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Bienvenido, {user?.nombre} 👋</h2>
        <p className="text-gray-500 mt-1">Panel de administración del CMS</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon="📄" label="Total Páginas" value={stats.pages} color="bg-blue-50" />
        <StatCard icon="✅" label="Publicadas" value={stats.published} color="bg-green-50" />
        <StatCard icon="🖼️" label="Recursos" value={stats.resources} color="bg-purple-50" />
        {user.rol === 'admin' && (
          <StatCard icon="👥" label="Usuarios" value={stats.users} color="bg-orange-50" />
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-3">Accesos rápidos</h3>
        <div className="flex flex-wrap gap-3">
          {user.rol !== 'lector' && (
            <a href="/dashboard/pages/new" className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition-colors">
              + Nueva página
            </a>
          )}
          {user.rol !== 'lector' && (
            <a href="/dashboard/resources" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
              + Subir recurso
            </a>
          )}
          {user.rol === 'admin' && (
            <a href="/dashboard/users" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors">
              + Nuevo usuario
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
