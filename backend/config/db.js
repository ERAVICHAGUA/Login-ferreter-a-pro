import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Cargar el archivo .env manualmente
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ✅ Crear el pool de conexión
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "admin123",
  database: process.env.DB_NAME || "ferreteria_pro",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 🔍 Probar la conexión automáticamente al iniciar
(async () => {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("✅ Conectado a la base de datos MySQL correctamente");
  } catch (error) {
    console.error("❌ Error al conectar con MySQL:", error);
  }
})();

export default db;
