import { motion } from "framer-motion";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Clock, Users, LogOut } from "lucide-react";

export default function Layout() {
  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
      isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50"
    }`;

  return (
    <div className="h-screen flex bg-slate-950 text-slate-200">
      <aside className="w-64 border-r border-slate-800 flex flex-col justify-between">
        {/* Sidebar superior */}
        <div>
          <div className="px-5 py-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white font-bold h-10 w-10 rounded-xl grid place-content-center">
                F
              </div>
              <div>
                <p className="font-semibold leading-tight">Ferretería</p>
                <p className="text-indigo-400 text-sm -mt-1">PRO</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <NavLink to="/" className={linkStyle}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/historial" className={linkStyle}>
              <Clock size={18} /> Mi Historial
            </NavLink>
            <NavLink to="/empleados" className={linkStyle}>
              <Users size={18} /> Empleados
            </NavLink>
          </nav>
        </div>

        {/* Sidebar inferior */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-slate-800 h-9 w-9 rounded-full grid place-content-center font-semibold">
              AY
            </div>
            <div>
              <p className="text-sm font-medium">Andy Yacila</p>
              <p className="text-xs text-slate-400">Desarrollador Jefe</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-900/30 border border-rose-800 rounded-lg text-sm hover:bg-rose-900/50 transition">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <motion.main
        className="flex-1 p-6 overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
