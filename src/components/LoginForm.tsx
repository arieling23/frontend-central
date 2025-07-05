'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useAuth } from '@/app/context/AuthContext';
import type { AxiosError } from 'axios';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.login(email, password);
      const { token } = response.data;

      login(token);
      router.push('/');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? 'Error desconocido al iniciar sesión';
      setError(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600">{error}</p>}

      <div>
        <label className="block font-semibold mb-1">Correo electrónico</label>
        <input
          type="email"
          className="w-full px-3 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Contraseña</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? 'Ingresando...' : 'Iniciar sesión'}
      </button>

      <div className="text-right">
        <a
          href="/password-recovery"
          className="text-sm text-blue-600 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </form>
  );
}
