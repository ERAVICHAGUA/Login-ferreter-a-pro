// backend/controllers/usuariosController.js
import db from "../config/db.js";
import bcrypt from "bcryptjs";

/* ======================================================
   📋 OBTENER TODOS LOS USUARIOS
====================================================== */
export const obtenerUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nombre, email, rol FROM usuarios ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error al obtener usuarios:", err);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

/* ======================================================
   ➕ CREAR NUEVO USUARIO
====================================================== */
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    // 🔍 Verificar si ya existe el correo
    const [existe] = await db.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existe.length > 0) {
      return res
        .status(400)
        .json({ message: "El correo ya está registrado" });
    }

    // 🔒 Encriptar contraseña
    const hashed = await bcrypt.hash(password, 10);

    // 💾 Guardar usuario
    await db.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashed, rol]
    );

    res.json({ message: "✅ Usuario creado correctamente" });
  } catch (err) {
    console.error("❌ Error al crear usuario:", err);
    res.status(500).json({ message: "Error al crear usuario" });
  }
};

/* ======================================================
   ✏️ EDITAR USUARIO EXISTENTE
====================================================== */
export const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID de usuario requerido" });
    }

    await db.query(
      "UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?",
      [nombre, email, rol, id]
    );

    res.json({ message: "✅ Usuario actualizado correctamente" });
  } catch (err) {
    console.error("❌ Error al editar usuario:", err);
    res.status(500).json({ message: "Error al editar usuario" });
  }
};

/* ======================================================
   🗑️ ELIMINAR USUARIO (con control de asistencias)
====================================================== */
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID requerido" });
    }

    // ⚙️ Verificar si el usuario tiene asistencias
    const [asistencias] = await db.query(
      "SELECT COUNT(*) AS total FROM asistencias WHERE usuario_id = ?",
      [id]
    );

    // ✅ Si tiene asistencias, eliminarlas primero
    if (asistencias[0].total > 0) {
      console.log(
        `Eliminando ${asistencias[0].total} asistencias del usuario ${id}`
      );
      await db.query("DELETE FROM asistencias WHERE usuario_id = ?", [id]);
    }

    // 🧍 Luego eliminar el usuario
    const [result] = await db.query("DELETE FROM usuarios WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      message: "🗑️ Usuario y asistencias eliminados correctamente ✅",
    });
  } catch (err) {
    console.error("❌ Error al eliminar usuario:", err);
    res
      .status(500)
      .json({ message: "Error interno al eliminar usuario o sus asistencias" });
  }
};
