import './globals.css';
import Header from '@/components/Header';
import type { Metadata } from 'next';
import { AuthProvider } from '@/app/context/AuthContext';

export const metadata: Metadata = {
  title: 'Flight App',
  description: 'Frontend Centralizado para microservicios',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 text-gray-800">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
