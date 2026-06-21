import { useState, useCallback } from 'react';
import { api } from '../api';

export function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('hml_user')); } catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    sessionStorage.setItem('hml_token', data.token);
    sessionStorage.setItem('hml_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('hml_token');
    sessionStorage.removeItem('hml_user');
    setUser(null);
  }, []);

  const register = useCallback(async (body) => {
    const data = await api.register(body);
    sessionStorage.setItem('hml_token', data.token);
    sessionStorage.setItem('hml_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const updateUser = useCallback((updated) => {
    sessionStorage.setItem('hml_user', JSON.stringify(updated));
    setUser(updated);
  }, []);

  return { user, login, logout, register, updateUser };
}
