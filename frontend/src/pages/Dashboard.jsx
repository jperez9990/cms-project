import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon, label, value, gradient }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center gap-4 hover:border-purple-500/30 transition-all">
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
        <h2 className="text-2xl font-bold text-white">Bienvenido, {user?.nombre} 👋</h2>
        <p className="text-gray-500 mt-1">Panel de administración del CMS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon="◈" label="Total Páginas" value={stats.pages} gradient="bg-purple-500/10 text-purple-400" />
        <StatCard icon="✦" label="Publicadas" value={stats.published} gradient="bg-green-500/10 text-green-400" />
        <StatCard icon="◉" label="Recursos" value={stats.resources} gradient="bg-indigo-500/10 text-indigo-400" />
        {user.rol === 'admin' && (
          <StatCard icon="◎" label="Usuarios" value={stats.users} gradient="bg-pink-500/10 text-pink-400" />
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Accesos rápidos</h3>
        <div className="flex flex-wrap gap-3">
          {user.rol !== 'lector' && (
            <a href="/dashboard/pages/new"
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              + Nueva página
            </a>
          )}
          {user.rol !== 'lector' && (
            <a href="/dashboard/resources"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              + Subir recurso
            </a>
          )}
          {user.rol === 'admin' && (
            <a href="/dashboard/users"
              className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              + Nuevo usuario
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
