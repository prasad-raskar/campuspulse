import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../config';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Ensure token isn't expired
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            // Set initial basic data from token for immediate routing
            setUser({ email: decoded.sub, role: decoded.role });
            localStorage.setItem('token', token);
            
            // Fetch full user profile to get class, branch, and name
            try {
              const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                const fullUser = await res.json();
                setUser(fullUser);
              }
            } catch (err) {
              console.error('Failed to fetch full profile', err);
            }
          }
        } catch (e) {
          logout();
        }
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
