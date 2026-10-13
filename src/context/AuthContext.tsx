'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  currency: string;
  settings?: any;
}

interface AuthContextType {
  user: User | null;
  business: Business | null;
  role: string | null;
  permissions: string[];
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User, business: Business, role: string, permissions: string[]) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  business: null,
  role: null,
  permissions: [],
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('maakleans_token');
    if (savedToken) {
      setToken(savedToken);
      fetchApi('/auth/me')
        .then(res => {
          if (res.success && res.data) {
            setUser(res.data.user);
            setBusiness(res.data.business);
            setRole(res.data.role);
            setPermissions(res.data.permissions || []);
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (
    newToken: string,
    newUser: User,
    newBusiness: Business,
    newRole: string,
    newPermissions: string[]
  ) => {
    localStorage.setItem('maakleans_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setBusiness(newBusiness);
    setRole(newRole);
    setPermissions(newPermissions);
  };

  const logout = () => {
    localStorage.removeItem('maakleans_token');
    setToken(null);
    setUser(null);
    setBusiness(null);
    setRole(null);
    setPermissions([]);
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        role,
        permissions,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
