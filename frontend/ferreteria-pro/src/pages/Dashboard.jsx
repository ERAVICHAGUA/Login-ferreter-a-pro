import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "/icons/logo_yuraqwasi.png";
import {
  MapPin,
  Clock,
  LogIn,
  LogOut,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [ubicacion, setUbicacion] = useState(null);
  const [direccion, setDireccion] = useState("");
  const [gpsActivo, setGpsActivo] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);

  /* ================= GPS ================= */
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

  const obtenerDireccion = async ({ latitude, longitude }) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      const data = await res.json();
      setDireccion(data.display_name || "Dirección no disponible");
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= ASISTENCIA ================= */
  const marcarAsistencia = async (tipo) => {
    if (!gpsActivo) return alert("Activa el GPS antes de marcar");

    try {
      setCargando(true);
      await axios.post(
        "http://localhost:4000/api/asistencias",
        { tipo, ubicacion, direccion },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      await obtenerHistorial();
    } catch {
      alert("Error al registrar asistencia");
    } finally {
      setCargando(false);
    }
  };

  const obtenerHistorial = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/asistencias", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setHistorial(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= LÓGICA CORRECTA ================= */

  // Ordenar por fecha ASC
  const historialOrdenado = useMemo(() => {
    return [...historial].sort(
      (a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora)
    );
  }, [historial]);

  // Emparejar entrada -> salida correctamente
  const pares = useMemo(() => {
    const resultado = [];
    let entradaPendiente = null;

    historialOrdenado.forEach((r) => {
      if (r.tipo === "entrada") {
        entradaPendiente = r;
      } else if (
        r.tipo === "salida" &&
        entradaPendiente &&
        new Date(r.fecha_hora) > new Date(entradaPendiente.fecha_hora)
      ) {
        resultado.push({
          entrada: entradaPendiente.fecha_hora,
          salida: r.fecha_hora,
          direccionEntrada: entradaPendiente.direccion,
          direccionSalida: r.direccion,
        });
        entradaPendiente = null;
      }
    });

    if (entradaPendiente) {
      resultado.push({
        entrada: entradaPendiente.fecha_hora,
        salida: null,
        direccionEntrada: entradaPendiente.direccion,
        direccionSalida: null,
      });
    }

    return resultado;
  }, [historialOrdenado]);

  const calcularDuracion = (entrada, salida) => {
    if (!entrada || !salida) return "—";
    const diff = new Date(salida) - new Date(entrada);
    if (diff <= 0) return "—";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  /* ================= EXPORTACIONES ================= */
  const exportarExcel = () => {
    const data = pares.map((p) => ({
      Entrada: new Date(p.entrada).toLocaleString("es-PE"),
      Salida: p.salida
        ? new Date(p.salida).toLocaleString("es-PE")
        : "—",
      Duración: calcularDuracion(p.entrada, p.salida),
      Dirección: p.direccionEntrada || "—",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencias");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "asistencias.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Asistencias - YURAQ WASI", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["Entrada", "Salida", "Duración"]],
      body: pares.map((p) => [
        new Date(p.entrada).toLocaleTimeString("es-PE"),
        p.salida ? new Date(p.salida).toLocaleTimeString("es-PE") : "—",
        calcularDuracion(p.entrada, p.salida),
      ]),
    });

    doc.save("asistencias.pdf");
  };

  useEffect(() => {
    obtenerUbicacion();
    obtenerHistorial();
  }, []);

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <LogoutButton />

      <div className="max-w-6xl mx-auto text-center mb-10">
        <img src={logo} className="w-20 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-indigo-300">
          Panel del Empleado
        </h1>
        <p className="text-slate-300">
          Bienvenido, <span className="font-semibold">{user?.nombre}</span>
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center gap-3">
          <MapPin className="text-emerald-400" />
          <span className="text-sm">
            {gpsActivo ? direccion : "GPS inactivo"}
          </span>
        </div>

        <button
          onClick={() => marcarAsistencia("entrada")}
          className="btn bg-emerald-600 text-white"
        >
          <LogIn size={18} /> Marcar Entrada
        </button>

        <button
          onClick={() => marcarAsistencia("salida")}
          className="btn bg-amber-500 text-white"
        >
          <LogOut size={18} /> Marcar Salida
        </button>
      </div>

      <div className="max-w-6xl mx-auto flex gap-3 mb-8">
        <button
          onClick={exportarExcel}
          className="btn bg-indigo-600 text-white"
        >
          <FileSpreadsheet size={18} /> Excel
        </button>
        <button
          onClick={exportarPDF}
          className="btn bg-rose-600 text-white"
        >
          <FileText size={18} /> PDF
        </button>
      </div>

      <div className="max-w-6xl mx-auto card">
        <h2 className="text-lg font-semibold mb-4 flex gap-2 items-center">
          <Clock /> Historial
        </h2>

        <table className="w-full text-sm">
          <thead className="border-b border-slate-700 text-slate-400">
            <tr>
              <th className="py-3 text-left">Entrada</th>
              <th className="py-3 text-left">Salida</th>
              <th className="py-3 text-left">Duración</th>
            </tr>
          </thead>
          <tbody>
            {pares.map((p, i) => (
              <tr
                key={i}
                className="border-b border-slate-800 hover:bg-slate-800/50"
              >
                <td className="py-4">
                  <div className="font-medium">
                    {new Date(p.entrada).toLocaleTimeString("es-PE")}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    📍 {p.direccionEntrada || "—"}
                  </div>
                </td>

                <td className="py-4">
                  {p.salida ? (
                    <>
                      <div className="font-medium">
                        {new Date(p.salida).toLocaleTimeString("es-PE")}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        📍 {p.direccionSalida || "—"}
                      </div>
                    </>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>

                <td className="py-4 font-semibold text-indigo-300">
                  {calcularDuracion(p.entrada, p.salida)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
