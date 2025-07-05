'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';

type Preferences = {
  language: string;
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  timezone: string;
};

const defaultPrefs: Preferences = {
  language: 'es',
  theme: 'light',
  emailNotifications: true,
  timezone: 'America/Guayaquil',
};

export default function PreferencesForm() {
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchPreferences = async () => {
    try {
      const res = await api.getPreferences();
      setPrefs(res.data);
    } catch {
      setMessage('❌ Error al obtener preferencias');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value } = target;

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setPrefs(prev => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setPrefs(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdate = async () => {
    try {
      const { language, theme, emailNotifications, timezone } = prefs;
      await api.updatePreferences({ language, theme, emailNotifications, timezone });
      setMessage('✅ Preferencias actualizadas');
    } catch {
      setMessage('❌ Error al actualizar preferencias');
    }
  };

  const handleReset = async () => {
    try {
      const res = await api.resetPreferences();
      setPrefs(res.data);
      setMessage('🔄 Preferencias restauradas');
    } catch {
      setMessage('❌ Error al restaurar preferencias');
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando preferencias...</p>;

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-4 text-center">Mis preferencias</h2>

      <label className="block mb-2">Idioma:</label>
      <select
        name="language"
        value={prefs.language}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="es">Español</option>
        <option value="en">Inglés</option>
      </select>

      <label className="block mb-2">Tema:</label>
      <select
        name="theme"
        value={prefs.theme}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="light">Claro</option>
        <option value="dark">Oscuro</option>
      </select>

      <label className="block mb-2">
        <input
          type="checkbox"
          name="emailNotifications"
          checked={prefs.emailNotifications}
          onChange={handleChange}
        />
        <span className="ml-2">Recibir notificaciones por correo</span>
      </label>

      <label className="block mt-4 mb-2">Zona horaria:</label>
      <input
        type="text"
        name="timezone"
        value={prefs.timezone}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded"
      />

      <div className="flex justify-between mt-6">
        <button
          onClick={handleUpdate}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Guardar
        </button>
        <button
          onClick={handleReset}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Restaurar
        </button>
      </div>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}
