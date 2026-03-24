// src/lib/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { adminLogin, adminLogout, getToken } from "@/lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      setUser({ token });
    }
  }, []);

  const login = async (email, password) => {
    const data = await adminLogin(email, password);
    setUser({ name: data.admin.name, email: data.admin.email });
    setIsAuthenticated(true);
    return data;
  };

  const logout = () => {
    adminLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};