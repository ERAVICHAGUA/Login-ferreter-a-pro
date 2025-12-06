// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";

// RUTA PRIVADA
const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;
  if (role && user.rol !== role) return <Navigate to="/dashboard" replace />;

  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <AdminPanel />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;
