'use client';

import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
      <LoginForm />
    </main>
  );
}
