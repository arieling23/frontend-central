'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <p className="text-center mt-10">Verificando sesión...</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cuenta de Usuario</h1>
      <p>Email: {user?.email}</p>
      <p>ID: {user?.userId}</p>
    </main>
  );
}
