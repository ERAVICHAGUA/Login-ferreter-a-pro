import React, { useEffect, useState } from "react";

const LayoutYuraqWasi = ({ children, titulo }) => {
  const [horaActual, setHoraActual] = useState("");
  const [saludo, setSaludo] = useState("");

  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      setHoraActual(
        ahora.toLocaleTimeString("es-PE", { hour12: false, timeStyle: "medium" })
      );

      const hora = ahora.getHours();
      if (hora < 12) setSaludo("🌅 ¡Buenos días!");
      else if (hora < 18) setSaludo("🌞 ¡Buenas tardes!");
      else setSaludo("🌙 ¡Buenas noches!");
    };
    actualizarHora();
    const intervalo = setInterval(actualizarHora, 1000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#4338ca,_transparent_60%),_radial-gradient(circle_at_bottom_right,_#2563eb,_transparent_60%)] opacity-30 animate-pulse"></div>

      {/* Encabezado */}
      <div className="z-10 w-full flex flex-col md:flex-row items-center justify-between px-8 py-4 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-md">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}icons/logo_yuraqwasi.png`}
            alt="YURAQ WASI"
            className="w-12 h-auto drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]"
          />
          <h1 className="text-xl font-bold tracking-wide text-indigo-300">
            {titulo || "FerreteríaPro - Sistema de Asistencia"}
          </h1>
        </div>

        <div className="text-right mt-2 md:mt-0">
          <p className="text-sm text-indigo-200">{saludo}</p>
          <p className="text-sm font-mono bg-white/10 px-4 py-1 rounded-full border border-white/20 inline-block mt-1">
            🕒 {horaActual}
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="z-10 w-full max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
};

export default LayoutYuraqWasi;
