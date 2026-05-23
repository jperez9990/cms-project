import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ nombre: user?.nombre || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ actual: '', nueva: '', confirmar: '' });
  const [successInfo, setSuccessInfo] = useState('');
  const [successPass, setSuccessPass] = useState('');
  const [errorInfo, setErrorInfo] = useState('');
  const [errorPass, setErrorPass] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const handleInfo = async (e) => {
    e.preventDefault();
    setErrorInfo('');
    setLoadingInfo(true);
    try {
      await api.put(`/users/${user.id}`, { nombre: form.nombre, email: form.email });
      const stored = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...stored, nombre: form.nombre, email: form.email }));
      setSuccessInfo('Información actualizada correctamente');
      setTimeout(() => setSuccessInfo(''), 3000);
    } catch (err) {
      setErrorInfo(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setLoadingInfo(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setErrorPass('');
    if (passwords.nueva !== passwords.confirmar)
      return setErrorPass('Las contraseñas no coinciden');
    if (passwords.nueva.length < 6)
      return setErrorPass('La contraseña debe tener al menos 6 caracteres');
    setLoadingPass(true);
    try {
      await api.put(`/users/${user.id}`, { password: passwords.nueva });
      setPasswords({ actual: '', nueva: '', confirmar: '' });
      setSuccessPass('Contraseña actualizada correctamente');
      setTimeout(() => setSuccessPass(''), 3000);
    } catch (err) {
      setErrorPass(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Mi perfil</h2>
        <p className="text-gray-500 mt-1">Gestiona tu información personal</p>
      </div>

      {/* Avatar y rol */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
          {user?.nombre?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{user?.nombre}</p>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full capitalize mt-1 inline-block">
            {user?.rol}
          </span>
        </div>
      </div>

      {/* Información personal */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h3 className="text-white font-semibold mb-4">Información personal</h3>
        {successInfo && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-4 text-sm">
            ✓ {successInfo}
          </div>
        )}
        {errorInfo && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {errorInfo}
          </div>
        )}
        <form onSubmit={handleInfo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
            <input type="text" required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Correo electrónico</label>
            <input type="email" required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <button type="submit" disabled={loadingInfo}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            {loadingInfo ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h3 className="text-white font-semibold mb-4">Cambiar contraseña</h3>
        {successPass && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-4 text-sm">
            ✓ {successPass}
          </div>
        )}
        {errorPass && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {errorPass}
          </div>
        )}
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nueva contraseña</label>
            <input type="password" required placeholder="Mínimo 6 caracteres"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600"
              value={passwords.nueva} onChange={(e) => setPasswords({ ...passwords, nueva: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar contraseña</label>
            <input type="password" required placeholder="Repite la contraseña"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600"
              value={passwords.confirmar} onChange={(e) => setPasswords({ ...passwords, confirmar: e.target.value })} />
          </div>
          <button type="submit" disabled={loadingPass}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            {loadingPass ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>

      {/* Cerrar sesión */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-2">Cerrar sesión</h3>
        <p className="text-gray-500 text-sm mb-4">Saldrás de tu cuenta en este dispositivo.</p>
        {!showLogout ? (
          <button onClick={() => setShowLogout(true)}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            Cerrar sesión
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-gray-400 text-sm">¿Estás seguro?</p>
            <button onClick={logout}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Sí, cerrar sesión
            </button>
            <button onClick={() => setShowLogout(false)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
