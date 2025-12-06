// ✅ Middleware de autenticación con JWT
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 🧠 Obtener token desde encabezado
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ msg: "No hay token, permiso denegado" });
    }

    // 🔐 Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;

    next();
  } catch (error) {
    console.error("❌ Error en middleware:", error);
    return res.status(401).json({ msg: "Token no válido o expirado" });
  }
};

// ✅ Exportación correcta (necesaria para evitar error “no default export”)
export default authMiddleware;
