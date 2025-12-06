import express from "express";
import {
  crearAsistencia,
  obtenerAsistencias,
  eliminarAsistencia,
} from "../controllers/asistenciaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 📌 Registrar nueva asistencia (entrada o salida)
router.post("/", authMiddleware, crearAsistencia);

// 📋 Obtener historial del usuario autenticado
router.get("/", authMiddleware, obtenerAsistencias);

// 🗑️ Eliminar asistencia (opcional desde panel admin)
router.delete("/:id", authMiddleware, eliminarAsistencia);

export default router;
