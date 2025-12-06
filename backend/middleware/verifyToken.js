import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(403).json({ message: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 👈 Aquí se guarda el usuario autenticado (id, rol, email)
    next();
  } catch (err) {
    console.error("❌ Error verificando token:", err);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
