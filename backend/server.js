import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import asistenciaRoutes from "./routes/asistenciaRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";

dotenv.config();

const app = express();

// ✅ Middlewares
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// ✅ Verificar conexión a la base de datos
try {
  const [rows] = await db.query("SELECT 1");
  console.log("✅ Conectado a la base de datos MySQL correctamente");
} catch (err) {
  console.error("❌ Error conectando a MySQL:", err);
}

// ✅ Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/asistencias", asistenciaRoutes); // ← PLURAL (coincide con el frontend)
app.use("/api/usuarios", usuariosRoutes);

// ✅ Ruta base
app.get("/", (req, res) => {
  res.send("Servidor backend de YURAQ WASI en funcionamiento 🚀");
});

// ✅ Puerto del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
);
