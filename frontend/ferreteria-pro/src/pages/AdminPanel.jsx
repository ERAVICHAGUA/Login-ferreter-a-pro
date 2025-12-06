import React, { useState, useEffect } from "react";
import axios from "axios";
import LogoutButton from "../components/LogoutButton";
import logo from "/icons/logo_yuraqwasi.png";

const AdminPanel = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("empleado");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  // === OBTENER USUARIOS ===
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

  // === CREAR O EDITAR USUARIO ===
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
        alert("Usuario actualizado correctamente ✅");
      } else {
        await axios.post(
          "http://localhost:4000/api/usuarios",
          { nombre, email, password, rol },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        alert("Usuario agregado correctamente ✅");
      }

      limpiarFormulario();
      obtenerUsuarios();
    } catch (err) {
      console.error("❌ Error al guardar usuario:", err);
      alert("Error al guardar usuario ❌");
    }
  };

  // === ELIMINAR USUARIO ===
  const eliminarUsuario = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Usuario eliminado correctamente 🗑️");
      obtenerUsuarios();
    } catch (err) {
      console.error("❌ Error al eliminar usuario:", err);
    }
  };

  // === CARGAR USUARIO EN FORMULARIO PARA EDITAR ===
  const editarUsuario = (user) => {
    setNombre(user.nombre);
    setEmail(user.email);
    setRol(user.rol);
    setModoEdicion(true);
    setUsuarioId(user.id);
  };

  // === LIMPIAR FORMULARIO ===
  const limpiarFormulario = () => {
    setNombre("");
    setEmail("");
    setPassword("");
    setRol("empleado");
    setModoEdicion(false);
    setUsuarioId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white p-6">
      <LogoutButton />

      <div className="max-w-6xl mx-auto text-center mb-10">
        <img src={logo} alt="YURAQ WASI Logo" className="w-24 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-indigo-300">
          Panel del Administrador - YURAQ WASI
        </h1>
      </div>

      {/* === FORMULARIO === */}
      <div className="bg-white/10 rounded-xl p-6 shadow-lg mb-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-indigo-300">
          {modoEdicion ? "✏️ Editar Usuario" : "➕ Agregar Usuario"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre"
            className="p-3 rounded bg-white/10 text-white focus:outline-none"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            className="p-3 rounded bg-white/10 text-white focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="p-3 rounded bg-white/10 text-white focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            className="p-3 rounded bg-white/10 text-white focus:outline-none"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="empleado">Empleado</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={guardarUsuario}
            className={`${
              modoEdicion
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            } px-4 py-2 rounded-lg font-semibold shadow`}
          >
            {modoEdicion ? "Actualizar" : "Agregar Usuario"}
          </button>
          {modoEdicion && (
            <button
              onClick={limpiarFormulario}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold shadow"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* === TABLA DE USUARIOS === */}
      <div className="bg-white/10 rounded-xl shadow-lg p-6 border border-gray-700 max-w-6xl mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-indigo-300">
          👥 Gestión de Usuarios
        </h3>

        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-gray-800 text-gray-400">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Correo</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-700 hover:bg-gray-800 transition"
              >
                <td className="px-4 py-2">{u.nombre}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 capitalize">{u.rol}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => editarUsuario(u)}
                    className="text-yellow-400 hover:text-yellow-300"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => eliminarUsuario(u.id)}
                    className="text-red-500 hover:text-red-400"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
