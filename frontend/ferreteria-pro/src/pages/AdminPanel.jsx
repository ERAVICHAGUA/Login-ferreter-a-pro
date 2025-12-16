import React, { useState, useEffect } from "react";
import axios from "axios";
import LogoutButton from "../components/LogoutButton";
import Card from "../components/Card";
import logo from "/icons/logo_yuraqwasi.png";

const AdminPanel = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("empleado");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  /* ================= OBTENER USUARIOS ================= */
  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/usuarios", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsuarios(res.data);
    } catch (err) {
      console.error("❌ Error al obtener usuarios:", err);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  /* ================= CREAR / EDITAR ================= */
  const guardarUsuario = async () => {
    if (!nombre || !email || !password || !rol) {
      alert("Todos los campos son obligatorios ❗");
      return;
    }

    try {
      if (modoEdicion) {
        await axios.put(
          `http://localhost:4000/api/usuarios/${usuarioId}`,
          { nombre, email, rol },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        alert("Usuario actualizado ✅");
      } else {
        await axios.post(
          "http://localhost:4000/api/usuarios",
          { nombre, email, password, rol },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        alert("Usuario agregado ✅");
      }

      limpiarFormulario();
      obtenerUsuarios();
    } catch (err) {
      alert("Error al guardar usuario ❌");
    }
  };

  /* ================= ELIMINAR ================= */
  const eliminarUsuario = async (id) => {
    if (!confirm("¿Eliminar usuario?")) return;
    await axios.delete(`http://localhost:4000/api/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    obtenerUsuarios();
  };

  /* ================= EDITAR ================= */
  const editarUsuario = (u) => {
    setNombre(u.nombre);
    setEmail(u.email);
    setRol(u.rol);
    setModoEdicion(true);
    setUsuarioId(u.id);
  };

  const limpiarFormulario = () => {
    setNombre("");
    setEmail("");
    setPassword("");
    setRol("empleado");
    setModoEdicion(false);
    setUsuarioId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ================= TOP BAR ================= */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} className="w-9" />
            <span className="font-semibold text-indigo-300">
              Panel Administrador – YURAQ WASI
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* ================= CONTENIDO ================= */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* ===== FORMULARIO ===== */}
        <Card
          title={modoEdicion ? "✏️ Editar Usuario" : "➕ Agregar Usuario"}
          subtitle="Crea usuarios y asigna roles dentro del sistema"
          className="max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-1 gap-4">
            <input
              className="input"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <input
              className="input"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <select
              className="input"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="empleado">Empleado</option>
            </select>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={guardarUsuario}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold"
              >
                {modoEdicion ? "Actualizar" : "Agregar"}
              </button>

              {modoEdicion && (
                <button
                  onClick={limpiarFormulario}
                  className="px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-700"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* ===== TABLA ===== */}
        <Card
          title="👥 Gestión de Usuarios"
          subtitle="Usuarios registrados en el sistema"
        >
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Correo</th>
                <th className="p-3 text-left">Rol</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3">{u.nombre}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.rol}</td>
                  <td className="p-3 flex gap-3">
                    <button onClick={() => editarUsuario(u)}>✏️</button>
                    <button onClick={() => eliminarUsuario(u.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

      </main>
    </div>
  );
};

export default AdminPanel;
