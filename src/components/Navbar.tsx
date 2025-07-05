'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-100 shadow">
      <Link href="/" className="font-bold text-lg">
        Mi App
      </Link>

      <div className="flex gap-4 items-center">
        {isAuthenticated && user ? (
          <>
            <span className="text-sm font-medium">
              👋 Hola, {user.email || user.userId}
            </span>

            <button
              onClick={logout}
              className="text-red-600 font-semibold hover:underline"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Iniciar sesión
            </Link>
            <Link href="/register" className="text-green-600 font-semibold hover:underline">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
