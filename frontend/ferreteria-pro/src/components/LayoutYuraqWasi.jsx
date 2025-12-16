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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(...)] opacity-30 animate-pulse"></div>

      {/* Encabezado */}
      <header className="sticky top-0 z-20 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur">
  <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
    
    {/* Logo + nombre */}
    <div className="flex items-center gap-3">
      <img
        src={`${import.meta.env.BASE_URL}icons/logo_yuraqwasi.png`}
        alt="YURAQ WASI"
        className="w-9 h-auto"
      />
      <span className="font-semibold tracking-wide text-indigo-300">
        YURAQ WASI
      </span>
    </div>

    {/* Saludo + hora */}
    <div className="text-right">
      <p className="text-xs text-slate-400">{saludo}</p>
      <p className="text-xs font-mono text-slate-300">
        {horaActual}
      </p>
    </div>
  </div>
</header>

      {/* Contenido principal */}
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default LayoutYuraqWasi;
