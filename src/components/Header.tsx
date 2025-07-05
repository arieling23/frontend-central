'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">Flight App</Link>

      <nav aria-label="Menú principal" className="space-x-4">
        {!isAuthenticated ? (
          <>
            <Link href="/register" className="hover:underline">Registrarse</Link>
            <Link href="/login" className="hover:underline">Iniciar sesión</Link>
          </>
        ) : (
          <>
            <Link href="/flight-catalog" className="hover:underline">Catálogo de Vuelos</Link>
            <Link href="/routes-catalog" className="hover:underline">Catálogo de Rutas</Link>
            <Link href="/seat-availability" className="hover:underline">Gestión de Asientos</Link>
            <Link href="/airport-info" className="hover:underline">Aeropuertos</Link>
            <Link href="/pricing-rules" className="hover:underline">Reglas de Precios</Link>

            {user?.role === 'admin' && (
              <Link href="/admin/rbac" className="hover:underline">Panel RBAC</Link>
            )}

            <Link href="/profile" className="hover:underline">Perfil</Link>
            <Link href="/preferences" className="hover:underline">Preferencias</Link>

            <button
              type="button"
              onClick={logout}
              className="hover:underline"
            >
              Cerrar sesión
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
