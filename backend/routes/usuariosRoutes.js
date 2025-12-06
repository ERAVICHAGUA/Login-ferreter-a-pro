import express from "express";
import {
  obtenerUsuarios,
  crearUsuario,
  editarUsuario,
  eliminarUsuario
} from "../controllers/usuariosController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// ✅ Rutas de usuario
router.get("/", verifyToken, obtenerUsuarios);
router.post("/", verifyToken, crearUsuario);
router.put("/:id", verifyToken, editarUsuario);
router.delete("/:id", verifyToken, eliminarUsuario);

export default router;
