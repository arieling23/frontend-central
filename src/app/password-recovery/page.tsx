'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function RecuperarContraseñaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); // 👈 Hook para redirección

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setLoading(true);

    try {
      await api.requestPasswordRecovery(email);
      setMensaje('📧 Revisa tu correo para continuar con la recuperación.');
      setEmail('');

      // ✅ Redirige luego de 3 segundos con token vacío (el usuario lo pegará)
      setTimeout(() => {
        router.push('/password-recovery/verify-token');
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || '❌ Error al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Recuperar contraseña</h2>

      {mensaje && <p className="text-green-600 mb-2">{mensaje}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Enviando...' : 'Enviar correo de recuperación'}
        </button>
      </form>
    </main>
  );
}
