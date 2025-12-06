// frontend/src/pages/Login.jsx
import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import logo from "/icons/logo_yuraqwasi.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [colorMensaje, setColorMensaje] = useState("text-red-400");
  const [cargando, setCargando] = useState(false);
  const captchaRef = useRef(null); // ✅ Referencia para reiniciar el captcha

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setCargando(true);

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password,
        captcha,
      });

      if (res.data.success) {
        login(res.data.token);
        setColorMensaje("text-green-400");
        setMensaje(res.data.msg);

        // ✅ Reiniciar captcha al iniciar sesión correctamente
        if (captchaRef.current) captchaRef.current.reset();
        setCaptcha(null);

        // Redirigir según el rol
        setTimeout(() => {
          if (res.data.user.rol === "admin") {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }, 1000);
      } else {
        setColorMensaje("text-red-400");
        setMensaje(res.data.msg || "Error al iniciar sesión");

        // 🔁 Reiniciar captcha si hay error
        if (captchaRef.current) {
          captchaRef.current.reset();
          setCaptcha(null);
        }
      }
    } catch (err) {
      setColorMensaje("text-red-400");
      setMensaje(
        err.response?.data?.msg || "❌ Error al iniciar sesión, intenta de nuevo."
      );

      // 🔁 Reiniciar captcha después de cualquier fallo
      if (captchaRef.current) {
        captchaRef.current.reset();
        setCaptcha(null);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white p-6">
      {/* LOGO */}
      <div className="text-center mb-6">
        <img
          src={logo}
          alt="YURAQ WASI Logo"
          className="w-28 h-auto mb-3 drop-shadow-lg animate-pulse mx-auto"
        />
        <h1 className="text-3xl font-bold text-indigo-300">YURAQ WASI</h1>
        <p className="text-gray-300 text-sm mt-1">
          Sistema de Control de Asistencia
        </p>
      </div>

      {/* FORMULARIO */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-xl border border-white/20"
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-indigo-200">
          Iniciar Sesión
        </h2>

        {/* CORREO */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Correo</label>
          <input
            type="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* CONTRASEÑA */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* CAPTCHA */}
        <div className="flex justify-center mb-4">
          <ReCAPTCHA
            ref={captchaRef}
            sitekey="6LchDfgrAAAAAJDfUUfpshd3Cg5UxFExAdgitJ_H"
            onChange={(value) => setCaptcha(value)}
          />
        </div>

        {/* BOTÓN */}
        <button
          type="submit"
          disabled={cargando}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            cargando
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

        {/* MENSAJE */}
        {mensaje && (
          <p
            className={`${colorMensaje} mt-4 text-center font-semibold animate-pulse`}
          >
            {mensaje}
          </p>
        )}
      </form>

      {/* FOOTER */}
      <p className="mt-6 text-gray-400 text-sm text-center">
        © {new Date().getFullYear()} YURAQ WASI — Sistema de Control de Asistencia
      </p>
    </div>
  );
};

export default Login;
