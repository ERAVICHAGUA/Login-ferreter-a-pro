// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 🔄 Cargar usuario desde el token al iniciar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("❌ Token inválido:", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // 🔐 Iniciar sesión
  const login = (token) => {
    localStorage.setItem("token", token);
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (error) {
      console.error("❌ Error decodificando token:", error);
    }
  };

  // 🚪 Cerrar sesión (forzando recarga del login con captcha nuevo)
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    // 👇 Esto fuerza la recarga total del login (resetea el captcha)
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
