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
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decoded = decodeToken<DecodedToken>(token);
        setIsAuthenticated(true);
        setUser(decoded);
      } catch (err) {
        console.error('❌ Token inválido');
        removeToken();
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  }, []);

  const login = (token: string) => {
    try {
      const decoded = decodeToken<DecodedToken>(token);
      saveToken(token);
      setIsAuthenticated(true);
      setUser(decoded);
    } catch (err) {
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
