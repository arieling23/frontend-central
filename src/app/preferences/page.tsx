'use client';

import PreferencesForm from '@/components/PreferencesForm';
import withAuth from '@/utils/withAuth';

function PreferencesPage() {
  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold text-center mb-6">
         Preferencias del Usuario
      </h1>
      <PreferencesForm />
    </main>
  );
}

// Protegido con withAuth para usuarios autenticados
export default withAuth(PreferencesPage);
