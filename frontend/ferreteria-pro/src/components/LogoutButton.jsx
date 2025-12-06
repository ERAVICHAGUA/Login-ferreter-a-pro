import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      title="Cerrar sesión"
      className="fixed top-5 right-6 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110 flex items-center justify-center"
    >
      <LogOut size={20} />
    </button>
  );
};

export default LogoutButton;
