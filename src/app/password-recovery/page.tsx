'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export default function RecuperarContraseñaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setLoading(true);

    try {
      await api.requestPasswordRecovery(email);
      setMensaje('📧 Revisa tu correo para continuar con la recuperación.');
      setEmail('');

      setTimeout(() => {
        router.push('/password-recovery/verify-token');
      }, 3000);
    } catch (err: unknown) {
      console.error(err);
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as any).response === 'object' &&
        'data' in (err as any).response &&
        typeof (err as any).response.data === 'object'
      ) {
        setError((err as any).response.data.error || '❌ Error al enviar la solicitud.');
      } else {
        setError('❌ Error desconocido al enviar la solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto mt-10 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">🔐 Recuperar contraseña</h2>

      {mensaje && <p className="text-green-600 text-center mb-4">{mensaje}</p>}
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Correo electrónico</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded"
            placeholder="ejemplo@correo.com"
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
