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

    const trimmedToken = token.trim();

    if (!trimmedToken) {
      setError('Por favor, ingresa el código recibido por correo.');
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmedToken)) {
      setError('El código ingresado no tiene un formato válido.');
      return;
    }

    router.push(`/password-recovery/reset?token=${encodeURIComponent(trimmedToken)}`);
  };

  return (
    <main className="p-6 max-w-md mx-auto mt-10 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">🔐 Verificar Código</h2>

      {error && <p className="text-red-600 mb-2 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">
            Ingrese el código recibido por correo
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Ej. 5a1d1cf5-9a4d-4b7d-bf43-1fd2e0cfe3a7"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!token.trim()}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          Verificar Código
        </button>
      </form>
    </main>
  );
}
