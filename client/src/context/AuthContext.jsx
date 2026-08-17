import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/endpoints.js';
import { tokenStore } from '../services/api.js';

const AuthContext = createContext(null);

const ADMIN_ROLES = ['admin', 'super_admin', 'content_manager'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    try {
      const { user } = await authApi.me();
      setUser(user);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
    const onUnauth = () => setUser(null);
    window.addEventListener('movexa:unauthorized', onUnauth);
    return () => window.removeEventListener('movexa:unauthorized', onUnauth);
  }, [loadMe]);

  const handleAuth = ({ token, user }) => {
    tokenStore.set(token);
    setUser(user);
    return user;
  };

  const login = async (body) => handleAuth(await authApi.login(body));
  const register = async (body) => handleAuth(await authApi.register(body));
  const resetPassword = async (body) => handleAuth(await authApi.resetPassword(body));

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  const updateProfile = async (body) => {
    const { user } = await authApi.updateMe(body);
    setUser(user);
    return user;
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user ? ADMIN_ROLES.includes(user.role) : false,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    refresh: loadMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
