import React, { useEffect, useState } from "react";
import axios from "axios";
import LayoutYuraqWasi from "../components/LayoutYuraqWasi";
import { MapPin, Clock, LogIn, LogOut, FileText } from "lucide-react";

const Employees = () => {
  const [historial, setHistorial] = useState([]);
  const [ubicacion, setUbicacion] = useState("");

  useEffect(() => {
    obtenerHistorial();
    obtenerUbicacion();
  }, []);

  const obtenerHistorial = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/asistencia", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setHistorial(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const obtenerUbicacion = () => {
    setUbicacion(
      "Calle Ensenada, Asociación California, Sector 12, Lima, Perú"
    );
  };

  return (
    <LayoutYuraqWasi titulo="Panel del Empleado">
      {/* === UBICACIÓN === */}
      <div className="card mb-6 flex items-center gap-3 text-sm">
        <MapPin className="text-emerald-400" />
        <span>{ubicacion}</span>
      </div>

      {/* === ACCIONES === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button className="btn bg-emerald-600 hover:bg-emerald-700 text-white">
          <LogIn size={18} /> Marcar Entrada
        </button>

        <button className="btn bg-amber-500 hover:bg-amber-600 text-white">
          <LogOut size={18} /> Marcar Salida
        </button>

        <button className="btn bg-indigo-600 hover:bg-indigo-700 text-white">
          <FileText size={18} /> Exportar Excel
        </button>

        <button className="btn bg-rose-600 hover:bg-rose-700 text-white">
          <FileText size={18} /> Exportar PDF
        </button>
      </div>

      {/* === HISTORIAL === */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock /> Historial de Marcaciones
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-2">Entrada</th>
                <th className="py-2">Salida</th>
                <th className="py-2">Duración</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="py-2">{h.horaEntrada || "--"}</td>
                  <td className="py-2">{h.horaSalida || "--"}</td>
                  <td className="py-2 font-semibold text-indigo-300">
                    {h.duracion || "0h"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LayoutYuraqWasi>
  );
};

export default Employees;
