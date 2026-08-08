import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';
import { getTokens, setTokens } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!getTokens()?.access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.fetchMe();
      setUser(me);
    } catch {
      setTokens(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    setTokens({ access: data.access, refresh: data.refresh });
    const me = await authApi.fetchMe();
    setUser(me);
    return me;
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    setTokens(data.tokens);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setTokens(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await authApi.fetchMe();
    setUser(me);
    return me;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
