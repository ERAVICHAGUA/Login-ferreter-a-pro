import db from "../config/db.js";

// 🧩 Crear nueva asistencia (entrada o salida)
export const crearAsistencia = async (req, res) => {
  const { tipo, ubicacion, direccion } = req.body;
  const usuarioId = req.usuario.id;

  if (!tipo || !ubicacion?.latitude || !ubicacion?.longitude) {
    return res.status(400).json({ msg: "Faltan datos de ubicación o tipo" });
  }

  try {
    // Verificar última asistencia
    const [ultima] = await db.query(
      "SELECT tipo, fecha_hora FROM asistencias WHERE usuario_id = ? ORDER BY fecha_hora DESC LIMIT 1",
      [usuarioId]
    );

    if (ultima.length > 0 && ultima[0].tipo === tipo) {
      return res.status(400).json({
        msg: `Ya registraste una ${tipo} recientemente.`,
      });
    }

    // Insertar nueva asistencia
    await db.query(
      `INSERT INTO asistencias 
       (usuario_id, tipo, latitud, longitud, direccion, estado) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        tipo,
        ubicacion.latitude,
        ubicacion.longitude,
        direccion || null,
        "registrado",
      ]
    );

    res.json({ msg: "✅ Asistencia registrada correctamente" });
  } catch (error) {
    console.error("❌ Error al registrar asistencia:", error);
    res.status(500).json({ msg: "Error al registrar asistencia" });
  }
};

// 📋 Obtener historial de asistencias del usuario autenticado
export const obtenerAsistencias = async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const [asistencias] = await db.query(
      "SELECT * FROM asistencias WHERE usuario_id = ? ORDER BY fecha_hora DESC",
      [usuarioId]
    );
    res.json(asistencias);
  } catch (error) {
    console.error("❌ Error al obtener asistencias:", error);
    res.status(500).json({ msg: "Error al obtener asistencias" });
  }
};

// 🧼 Eliminar asistencia (solo si se usa en panel admin)
export const eliminarAsistencia = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM asistencias WHERE id = ?", [id]);
    res.json({ msg: "🗑️ Asistencia eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar asistencia:", error);
    res.status(500).json({ msg: "Error al eliminar asistencia" });
  }
};
