import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import logo from "/icons/logo_yuraqwasi.png";
import { Mail, Lock, UserCog, User } from "lucide-react";
import InputWithIcon from "../components/InputWithIcon";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // === STATES ===
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("empleado"); // ✅ ADMIN / EMPLEADO
  const [captcha, setCaptcha] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [colorMensaje, setColorMensaje] = useState("text-red-400");
  const [cargando, setCargando] = useState(false);

  const captchaRef = useRef(null);

  // === SUBMIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setCargando(true);

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password,
        captcha,
        rol, // 🔐 IMPORTANTE
      });

      if (res.data.success) {
        login(res.data.token);
        setColorMensaje("text-green-400");
        setMensaje(res.data.msg);

        if (captchaRef.current) captchaRef.current.reset();
        setCaptcha(null);

        setTimeout(() => {
          res.data.user.rol === "admin"
            ? navigate("/admin")
            : navigate("/dashboard");
        }, 800);
      }
    } catch (err) {
      setColorMensaje("text-red-400");
      setMensaje(
        err.response?.data?.msg || "❌ Error al iniciar sesión"
      );

      if (captchaRef.current) captchaRef.current.reset();
      setCaptcha(null);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8">
        
        {/* LOGO */}
        <div className="text-center mb-6">
          <img src={logo} alt="YURAQ WASI" className="w-24 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-indigo-300">
            YURAQ WASI
          </h1>
          <p className="text-sm text-slate-300">
            Sistema de Control de Asistencia
          </p>
        </div>

        {/* SELECTOR ROL */}
        <div className="flex bg-slate-900/60 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setRol("empleado")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition
              ${rol === "empleado"
                ? "bg-indigo-600 text-white"
                : "text-slate-300 hover:bg-white/10"}`}
          >
            <User size={18} /> Empleado
          </button>

          <button
            type="button"
            onClick={() => setRol("admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition
              ${rol === "admin"
                ? "bg-indigo-600 text-white"
                : "text-slate-300 hover:bg-white/10"}`}
          >
            <UserCog size={18} /> Administrador
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputWithIcon
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@empresa.com"
          />

          <InputWithIcon
            icon={Lock}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
          />

          <div className="flex justify-center">
            <ReCAPTCHA
              ref={captchaRef}
              sitekey="6LezfSssAAAAAPbC8xylFKkPNYeC-F-G-bWDVB6v"
              onChange={(value) => setCaptcha(value)}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-3 rounded-xl font-semibold transition
              ${cargando
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700"}`}
          >
            {cargando ? "Validando..." : "Ingresar"}
          </button>
        </form>

        {/* MENSAJE */}
        {mensaje && (
          <p className={`${colorMensaje} mt-4 text-center font-semibold`}>
            {mensaje}
          </p>
        )}

        {/* FOOTER */}
        <p className="mt-6 text-xs text-center text-slate-400">
          © {new Date().getFullYear()} YURAQ WASI
        </p>
      </div>
    </div>
  );
};

export default Login;
