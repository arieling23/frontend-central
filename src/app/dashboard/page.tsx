'use client';

import withAuth from '@/utils/withAuth';
import { useAuth } from '@/app/context/AuthContext';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <main className="p-6">
      <h2 className="text-2xl font-bold mb-4">Panel de Usuario</h2>
      <p>Bienvenido, <strong>{user?.email}</strong></p>
      <p>Tu ID es: <code>{user?.userId}</code></p>
    </main>
  );
}

export default withAuth(DashboardPage);
