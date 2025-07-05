import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'token';

// Guarda el token en localStorage
export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

// Obtiene el token desde localStorage
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Elimina el token
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Decodifica cualquier token con un tipo genérico
export function decodeToken<T>(token: string): T {
  return jwtDecode<T>(token);
}

// Verifica si el token es válido (no expirado)
export function isTokenValid(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = decodeToken<DecodedToken>(token);
    return decoded.exp * 1000 > Date.now(); // exp en segundos → milisegundos
  } catch {
    return false;
  }
}

// Decodifica el token guardado y retorna los datos del usuario
export function getUserFromToken(): DecodedToken | null {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = decodeToken<DecodedToken>(token);
    return decoded;
  } catch (err) {
    console.error('❌ Token inválido:', err);
    return null;
  }
}

// Tipo base para el usuario decodificado
export interface DecodedToken {
  userId: string;
  email?: string;
  role?: string;
  iat: number;
  exp: number;
}
