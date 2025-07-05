'use client';

import withAuth from '@/utils/withAuth';
import { useAuth } from '@/app/context/AuthContext';

function AdminPage() {
  const { user } = useAuth();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      <p>Bienvenido, administrador <strong>{user?.email}</strong></p>
    </main>
  );
}

// Solo 'admin' puede acceder
export default withAuth(AdminPage, ['admin']);
