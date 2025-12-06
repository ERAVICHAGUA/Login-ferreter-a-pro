import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function HeaderInfo() {
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState("");

  // Actualizar hora y saludo
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);
      setGreeting(getGreeting(now));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getGreeting = (now) => {
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) return "Buenos días 🌅";
    if (hour >= 12 && hour < 18) return "Buenas tardes 🌇";
    return "Buenas noches 🌙";
  };

  // Manejo del GPS
  const handleGPS = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setLoading(false);
      },
      () => {
        alert("No se pudo obtener tu ubicación 😢");
        setLoading(false);
      }
    );
  };

  return (
    <div className="flex items-center justify-between mb-6">
      {/* IZQUIERDA: Título + saludo */}
      <div>
        <h1 className="text-4xl font-extrabold text-indigo-400 tracking-wide drop-shadow-md transition-all duration-300">
          YURAQ WASI
        </h1>
        <p className="text-lg text-slate-300 font-medium mt-1">
          {greeting}, Andy.
        </p>
      </div>

      {/* DERECHA: Reloj + Fecha + GPS */}
      <div className="flex flex-col items-end text-right">
        <p className="text-3xl font-bold text-indigo-400 tracking-wide drop-shadow-md transition-all duration-300 animate-pulse-slow">
          {format(time, "hh:mm:ss aaaa")}
        </p>

        <p className="text-base text-slate-400 font-medium">
          {format(time, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>

        <button
          onClick={handleGPS}
          className="mt-3 px-4 py-1 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all duration-200 active:scale-95"
          disabled={loading}
        >
          {loading ? "Obteniendo ubicación..." : "Permitir GPS"}
        </button>

        {location && (
          <p className="text-xs text-slate-400 mt-1">
            Lat: {location.latitude.toFixed(3)}, Lon:{" "}
            {location.longitude.toFixed(3)}
          </p>
        )}
      </div>
    </div>
  );
}
