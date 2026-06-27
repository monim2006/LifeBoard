import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../../features/auth/api/authApi';

interface AuthContextValue {
  user: authApi.AuthPayload['user'] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<authApi.AuthPayload['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    localStorage.setItem('lifeboard_access_token', result.accessToken);
    setUser(result.user);
  };

  const register = async (email: string, username: string, password: string) => {
    const result = await authApi.register(email, username, password);
    localStorage.setItem('lifeboard_access_token', result.accessToken);
    setUser(result.user);
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem('lifeboard_access_token');
    setUser(null);
  };

  const refresh = async () => {
    try {
      const token = localStorage.getItem('lifeboard_access_token');
      if (!token) {
        setUser(null);
        return;
      }
      const result = await authApi.refreshSession();
      localStorage.setItem('lifeboard_access_token', result.accessToken);
      setUser(result.user);
    } catch {
      localStorage.removeItem('lifeboard_access_token');
      setUser(null);
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
