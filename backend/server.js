import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import asistenciaRoutes from "./routes/asistenciaRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


dotenv.config();

const app = express();

//Helmet for security
app.use(
  helmet({
    crossOriginResourcePolicy: false, // evita bloqueos con frontend separado
  })
);

//Rate limiting in Login 
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 30, // 30 intentos por IP en 10 minutos
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, msg: "Demasiados intentos. Intenta más tarde." },
});


// ✅ Middlewares
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",];

  app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (Postman, curl)
      if (!origin) return callback(null, true);

      // Permitir solo orígenes definidos
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Bloquear cualquier otro origen
      return callback(new Error("No permitido por CORS"));
    },
    credentials: true,
  })
);

app.use("/api/auth/login", loginLimiter);


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

/* =========================================================
   ✅ PASO 5: MANEJO CENTRALIZADO DE ERRORES (OWASP)
========================================================= */
app.use((err, req, res, next) => {
  console.error("❌ Error no controlado:", err.message);

  res.status(500).json({
    success: false,
    msg: "Error interno del servidor",
  });
});

// ✅ Puerto del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
);
