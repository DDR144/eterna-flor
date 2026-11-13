'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from './api';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // La comprobación inicial vive dentro del efecto como cadena de promesas:
  // el estado se fija en las continuaciones, no en el cuerpo del efecto, y el
  // indicador de cancelación evita escribir sobre un componente desmontado.
  useEffect(() => {
    let cancelado = false;

    api.auth
      .profile()
      .then((profile) => {
        if (!cancelado) setUser(profile);
      })
      .catch(() => {
        if (!cancelado) setUser(null);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  async function login(email: string, password: string) {
    const { user } = await api.auth.login(email, password);
    setUser(user);
  }

  async function logout() {
    try {
      await api.auth.logout();
    } catch {
    }
    setUser(null);
  }

  async function register(email: string, password: string) {
    const result = await api.auth.register(email, password);
    setUser(result);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}