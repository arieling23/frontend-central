'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyTokenPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Por favor, ingresa un token.');
      return;
    }

    // Aquí simplemente redirigimos al usuario con el token en la URL
    router.push(`/password-recovery/reset?token=${encodeURIComponent(token)}`);
  };

  return (
    <main className="p-6 max-w-md mx-auto mt-10 border rounded">
      <h2 className="text-2xl font-bold mb-4">Verificar Codigo</h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">
            Ingrese el codigo recibido por correo
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Verificar token
        </button>
      </form>
    </main>
  );
}
