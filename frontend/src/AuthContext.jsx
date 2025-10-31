// frontend/src/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from './config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(null); // { user, token }

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('authUser') || 'null');
    if (token && user) setAuthData({ token, user });
  }, []);

  const login = async (username, password) => {
    const res = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      setAuthData({ token: data.token, user: data.user });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setAuthData(null);
  };

  const signup = async (username, password) => {
    const res = await fetch(API_ENDPOINTS.SIGNUP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.ok;
  };

  return (
    <AuthContext.Provider value={{ 
      user: authData?.user, 
      isLoggedIn: !!authData, 
      isAdmin: authData?.user?.role === 'admin',
      login, 
      logout,
      signup
    }}>
      {children}
    </AuthContext.Provider>
  );
}