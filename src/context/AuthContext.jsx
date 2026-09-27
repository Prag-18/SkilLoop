import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('skillloop_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('skillloop_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check token validity on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('skillloop_token');
      if (storedToken) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          localStorage.setItem('skillloop_user', JSON.stringify(userData));
        } catch (err) {
          console.error("Failed to verify user token:", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authAPI.login({ email, password });
      const { access_token, user: userData } = data;

      localStorage.setItem('skillloop_token', access_token);
      localStorage.setItem('skillloop_user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      const message = err.response?.data?.detail || 'Invalid credentials or server error.';
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  };

  const register = async (registrationData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authAPI.register(registrationData);
      const { access_token, user: userData } = data;

      localStorage.setItem('skillloop_token', access_token);
      localStorage.setItem('skillloop_user', JSON.stringify(userData));

      setToken(access_token);
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed. Please check inputs.';
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('skillloop_token');
    localStorage.removeItem('skillloop_user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
