// src/lib/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getToken, setToken, getMe } from '@/lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await getMe();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('[Auth] Failed to load user:', e);
      apiLogout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    if (data.access_token) {
      setToken(data.access_token);
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
      return userData;
    } catch (e) {
      console.error('[Auth] Failed to refresh user:', e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
