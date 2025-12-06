import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

// 🧠 Control temporal de intentos por usuario (en memoria)
const intentosFallidos = {}; // { email: { count: 0, bloqueadoHasta: timestamp } }
const BLOQUEO_MS = 5 * 60 * 1000; // 5 minutos

export const login = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

    if (!email || !password || !captcha) {
      return res.status(400).json({ success: false, msg: "Faltan datos requeridos" });
    }

    // ✅ Verificar CAPTCHA con Google
    const verify = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`
    );
    if (!verify.data.success) {
      return res.status(400).json({ success: false, msg: "Captcha inválido" });
    }

    const ahora = Date.now();
    const registro = intentosFallidos[email];

    // 🚫 Verificar si está bloqueado
    if (registro?.bloqueadoHasta && registro.bloqueadoHasta > ahora) {
      const minutosRestantes = Math.ceil((registro.bloqueadoHasta - ahora) / 60000);
      return res.status(403).json({
        success: false,
        msg: `🚫 Cuenta bloqueada temporalmente. Intenta nuevamente en ${minutosRestantes} minuto(s).`,
      });
    }

    // 🧠 Buscar usuario
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    const user = rows[0];

    if (!user) {
      registrarIntento(email);
      const restantes = intentosRestantes(email);
      return res.status(400).json({
        success: false,
        msg:
          restantes > 0
            ? `Credenciales incorrectas. Te quedan ${restantes} intento(s).`
            : "🚫 Cuenta bloqueada por 5 minutos.",
      });
    }

    // 🔑 Verificar contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      registrarIntento(email);
      const restantes = intentosRestantes(email);
      return res.status(400).json({
        success: false,
        msg:
          restantes > 0
            ? `❌ Contraseña incorrecta. Te quedan ${restantes} intento(s).`
            : "🚫 Cuenta bloqueada por 5 minutos.",
      });
    }

    // ✅ Login correcto → limpiar intentos
    delete intentosFallidos[email];

    // 🪪 Crear token JWT
    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    console.log(`✅ Usuario autenticado: ${user.email}`);

    return res.json({
      success: true,
      msg: "Inicio de sesión exitoso ✅",
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ success: false, msg: "Error interno del servidor" });
  }
};

// 🔧 Auxiliares de bloqueo
function registrarIntento(email) {
  const ahora = Date.now();
  if (!intentosFallidos[email]) {
    intentosFallidos[email] = { count: 1, bloqueadoHasta: 0 };
    return;
  }

  intentosFallidos[email].count++;

  if (intentosFallidos[email].count >= 3) {
    intentosFallidos[email].bloqueadoHasta = ahora + BLOQUEO_MS;
    intentosFallidos[email].count = 0;
    console.log(`🚫 Usuario bloqueado: ${email}`);
    setTimeout(() => delete intentosFallidos[email], BLOQUEO_MS + 1000);
  }
}

function intentosRestantes(email) {
  const registro = intentosFallidos[email];
  if (!registro) return 2;
  if (registro.bloqueadoHasta && registro.bloqueadoHasta > Date.now()) return 0;
  return 3 - registro.count;
}

// ✅ Registro de usuario
export const register = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ success: false, msg: "Todos los campos son obligatorios" });
  }

  try {
    const [exists] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (exists.length > 0) {
      return res.status(400).json({ success: false, msg: "El correo ya está registrado" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashed, rol || "empleado"]
    );

    console.log(`✅ Usuario registrado: ${email}`);
    res.status(201).json({ success: true, msg: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("❌ Error en registro:", error);
    res.status(500).json({ success: false, msg: "Error en el servidor" });
  }
};
