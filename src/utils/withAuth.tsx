import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import type { ComponentType, FC } from 'react';

type Role = 'admin' | 'user' | string;

export default function withAuth<P extends {}>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: Role[] = []
): FC<P> {
  const ProtectedComponent: FC<P> = (props: P) => {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user?.role || '')
      ) {
        router.push('/unauthorized');
      }
    }, [isAuthenticated, user, router]);

    // Protección en renderizado
    if (
      !isAuthenticated ||
      (allowedRoles.length > 0 && !allowedRoles.includes(user?.role || ''))
    ) {
      return <p className="text-center mt-10">Verificando sesión...</p>;
    }

    return <WrappedComponent {...props} />;
  };

  return ProtectedComponent;
}
