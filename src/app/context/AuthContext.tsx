'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, removeToken, decodeToken } from '@/utils/auth';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: DecodedToken | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean; 
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  loading: true, 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = decodeToken<DecodedToken>(token);
        setIsAuthenticated(true);
        setUser(decoded);
      } catch {
        console.error('❌ Token inválido');
        removeToken();
        setIsAuthenticated(false);
        setUser(null);
      }
    }
    setLoading(false); 
  }, []);

  const login = (token: string) => {
    try {
      const decoded = decodeToken<DecodedToken>(token);
      saveToken(token);
      setIsAuthenticated(true);
      setUser(decoded);
    } catch {
      console.error('❌ No se pudo decodificar el token');
    }
  };

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
