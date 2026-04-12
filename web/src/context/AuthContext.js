import React, { createContext, useContext, useState, useEffect } from 'react';
import { connexion as apiConnexion, inscription as apiInscription } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const seConnecter = async (credentials) => {
    const res = await apiConnexion(credentials);
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('user_data', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const sInscrire = async (data) => {
    const res = await apiInscription(data);
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('user_data', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const seDeconnecter = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
    window.location.href = '/connexion';
  };

  return (
    <AuthContext.Provider value={{ user, loading, seConnecter, sInscrire, seDeconnecter }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
