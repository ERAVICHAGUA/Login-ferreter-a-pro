import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "/icons/logo_yuraqwasi.png";

const Dashboard = () => {
  const { user } = useAuth();
  const [ubicacion, setUbicacion] = useState(null);
  const [direccion, setDireccion] = useState("");
  const [gpsActivo, setGpsActivo] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);

  // === OBTENER UBICACIÓN ===
  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUbicacion(coords);
        setGpsActivo(true);
        await obtenerDireccion(coords);
      },
      () => alert("No se pudo obtener la ubicación")
    );
  };

  // === CONVERTIR COORDENADAS A DIRECCIÓN ===
  const obtenerDireccion = async ({ latitude, longitude }) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      const data = await res.json();
      setDireccion(data.display_name || "Dirección no disponible");
    } catch (err) {
      console.error("Error obteniendo dirección:", err);
    }
  };

  // === MARCAR ENTRADA / SALIDA ===
  const marcarAsistencia = async (tipo) => {
    if (!gpsActivo) return alert("Activa el GPS antes de marcar asistencia");

    try {
      setCargando(true);
      await axios.post(
        "http://localhost:4000/api/asistencias",
        { tipo, ubicacion, direccion },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Asistencia registrada correctamente ✅");
      obtenerHistorial();
    } catch {
      alert("No se pudo registrar la asistencia ❌");
    } finally {
      setCargando(false);
    }
  };

  // === OBTENER HISTORIAL DESDE BACKEND ===
  const obtenerHistorial = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/asistencias", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setHistorial(res.data);
    } catch (error) {
      console.error("Error al obtener historial:", error);
    }
  };

  // === CALCULAR DURACIÓN ===
  const calcularDuracion = (entrada, salida) => {
    if (!entrada || !salida) return "Pendiente ⏳";
    const diffMs = new Date(salida) - new Date(entrada);
    if (diffMs < 0) return "—";
    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
    return `${horas}h ${minutos}m`;
  };

  useEffect(() => {
    obtenerUbicacion();
    obtenerHistorial();
  }, []);

  // === AGRUPAR POR DÍA ===
  const historialAgrupado = historial.reduce((acc, item) => {
    const fecha = new Date(item.fecha_hora).toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(item);
    return acc;
  }, {});

  // === EXPORTAR EXCEL ===
  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(historial);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencias");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const archivo = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(archivo, "asistencias.xlsx");
  };

  // === EXPORTAR PDF ===
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("YURAQ WASI - Reporte de Asistencias", 14, 15);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Empleado: ${user?.nombre || "Usuario"}`, 14, 22);
    doc.text(`Generado: ${new Date().toLocaleString("es-PE")}`, 14, 28);

    const columnas = ["Fecha", "Entrada", "Salida", "Duración", "Dirección"];
    const filas = [];

    Object.entries(historialAgrupado).forEach(([fecha, registros]) => {
      const entradas = registros.filter((r) => r.tipo === "entrada");
      const salidas = registros.filter((r) => r.tipo === "salida");

      entradas.forEach((ent, i) => {
        const sal = salidas[i];
        filas.push([
          fecha,
          new Date(ent.fecha_hora).toLocaleTimeString("es-PE"),
          sal ? new Date(sal.fecha_hora).toLocaleTimeString("es-PE") : "—",
          calcularDuracion(ent.fecha_hora, sal?.fecha_hora),
          ent.direccion || "—",
        ]);
      });
    });

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 35,
      theme: "striped",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save("asistencias.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white p-6">
      <LogoutButton />

      <div className="max-w-6xl mx-auto text-center mb-10">
        <img src={logo} alt="YURAQ WASI Logo" className="w-24 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-indigo-300">
          Panel del Empleado - YURAQ WASI
        </h1>
        <p className="text-gray-300 mt-2">
          Bienvenido,{" "}
          <span className="text-indigo-200 font-semibold">{user?.nombre}</span>
        </p>
      </div>

      {/* GPS */}
      <div className="bg-white/10 p-5 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row items-center justify-between">
        <span
          className={`px-4 py-2 rounded-lg font-semibold ${
            gpsActivo ? "bg-green-700" : "bg-red-700"
          }`}
        >
          {gpsActivo ? `📍 ${direccion}` : "📍 GPS inactivo"}
        </span>
        {!gpsActivo && (
          <button
            onClick={obtenerUbicacion}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 mt-3 md:mt-0 rounded-lg font-semibold"
          >
            Activar GPS
          </button>
        )}
      </div>

      {/* BOTONES */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <button
          onClick={() => marcarAsistencia("entrada")}
          className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-lg font-semibold shadow-md"
        >
          Marcar Entrada
        </button>
        <button
          onClick={() => marcarAsistencia("salida")}
          className="bg-yellow-500 hover:bg-yellow-600 px-5 py-3 rounded-lg font-semibold shadow-md"
        >
          Marcar Salida
        </button>
        <button
          onClick={exportarExcel}
          className="bg-emerald-600 hover:bg-emerald-700 px-5 py-3 rounded-lg font-semibold shadow-md"
        >
          📘 Exportar Excel
        </button>
        <button
          onClick={exportarPDF}
          className="bg-rose-600 hover:bg-rose-700 px-5 py-3 rounded-lg font-semibold shadow-md"
        >
          📄 Exportar PDF
        </button>
      </div>

      {/* HISTORIAL */}
      <div className="bg-white/10 rounded-xl shadow-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-indigo-300">
          📖 Historial de Marcaciones
        </h3>

        {Object.entries(historialAgrupado).map(([fecha, registros]) => {
          const entradas = registros.filter((r) => r.tipo === "entrada");
          const salidas = registros.filter((r) => r.tipo === "salida");

          return (
            <div key={fecha} className="mb-6">
              <h4 className="text-indigo-400 font-semibold border-b border-indigo-600 pb-1 mb-3 text-lg">
                📅 {fecha.charAt(0).toUpperCase() + fecha.slice(1)}
              </h4>
              <table className="w-full text-sm text-left text-gray-300 rounded-lg overflow-hidden">
                <thead className="text-xs uppercase bg-gray-800 text-gray-400">
                  <tr>
                    <th className="px-4 py-2">Hora Entrada / Dirección</th>
                    <th className="px-4 py-2">Hora Salida / Dirección</th>
                    <th className="px-4 py-2">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {entradas.map((ent, i) => {
                    const sal = salidas[i];
                    const dur = calcularDuracion(ent.fecha_hora, sal?.fecha_hora);

                    return (
                      <tr
                        key={i}
                        className="border-b border-gray-700 hover:bg-gray-800 transition"
                      >
                        <td className="px-4 py-2">
                          {new Date(ent.fecha_hora).toLocaleTimeString("es-PE")}
                          <br />
                          <span className="text-xs text-gray-400">
                            📍 {ent.direccion || "Sin dirección"}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {sal
                            ? new Date(sal.fecha_hora).toLocaleTimeString("es-PE")
                            : "—"}
                          <br />
                          <span className="text-xs text-gray-400">
                            📍 {sal?.direccion || "Sin dirección"}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-semibold text-indigo-200">
                          {dur}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
