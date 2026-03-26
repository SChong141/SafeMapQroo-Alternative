// src/components/ShelterDashboardOrganizer.jsx
import React, { useEffect, useRef, useState } from "react";
import { Shield, LogOut, Home, RefreshCw, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { getShelters } from "../api/Requests/shelter/GetSheltersHook";
import { getOneShelters } from "../api/Requests/shelter/GetOneShelterHook";
import { updateOccupancy } from "../api/Requests/occupancy/UpdateOccupancyHook";
import { getOccupancy } from "../api/Requests/occupancy/GetOccupancyHook";

/* ─── Sidebar ─────────────────────────────────────────────── */
function OrganizerSidebar() {
  const userName = localStorage.getItem("userName") || "Organizador";
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <aside
      className="w-64 flex flex-col shadow-2xl shrink-0 bg-[#611232]"
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-wide">
            SafeMap<span className="text-red-300">QROO</span>
          </span>
        </div>
        <p className="text-white/40 text-xs pl-11">Panel organizador</p>
      </div>

      {/* User card */}
      <div className="mx-4 mt-5 mb-2 bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-300 to-rose-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="overflow-hidden">
          <div className="text-white text-sm font-semibold truncate">{userName}</div>
          <div className="text-white/50 text-xs">Organizador</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        <p className="text-white/30 text-xs uppercase tracking-widest px-3 mb-2">Menú</p>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/15 text-white cursor-pointer transition-all">
          <Home size={16} className="text-red-300" />
          <span className="text-sm font-medium">Mi refugio</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-300"></span>
        </a>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all w-full"
        >
          <LogOut size={16} />
          <span className="text-sm">Cerrar sesión</span>
        </Link>
      </div>
    </aside>
  );
}

/* ─── Panel detalle + formulario ─────────────────────────── */
function ShelterDetailPanel({ shelter }) {
  const shelterId = shelter?.id;
  const { data, loading, error } = getOneShelters(shelterId);
  const { updateOccupancy: updateOcc, loading: updating, error: updateError } = updateOccupancy();

  const [newOccupancy, setNewOccupancy] = useState("");
  const [localShelter, setLocalShelter] = useState(null);
  const [warning, setWarning] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (data) setLocalShelter(data);
  }, [data]);

  if (!shelterId) return null;

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-white p-4 rounded-lg shadow-sm">
      <p className="text-gray-400 text-sm">Cargando información del refugio...</p>
    </div>
  );

  if (error || !localShelter) return (
    <div className="flex-1 flex items-center justify-center bg-white p-4 rounded-lg shadow-sm">
      <p className="text-gray-400 text-sm">Error al obtener los datos del refugio.</p>
    </div>
  );

  const shelterDetails = localShelter;
  const occupancyArray = Array.isArray(shelterDetails?.occupancy) ? shelterDetails.occupancy : [];
  const totalOccupancy = occupancyArray.reduce((t, e) => t + e.currentOccupancy, 0);
  const pct = shelterDetails.capacity > 0 ? Math.min((totalOccupancy / shelterDetails.capacity) * 100, 100) : 0;
  const barColor = pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-yellow-400" : "bg-green-500";

  const organizers = Array.isArray(shelterDetails.organizer)
    ? shelterDetails.organizer
    : shelterDetails.organizer ? [shelterDetails.organizer] : [];

  const handleUpdate = async () => {
    const newValue = Number(newOccupancy);

    if (newOccupancy === "" || newOccupancy === null) {
      setWarning("Ingresa una cantidad antes de actualizar.");
      return;
    }
    if (isNaN(newValue)) {
      setWarning("Ingresa un número válido.");
      return;
    }
    if (newValue === 0) {
      setWarning("El valor no puede ser 0.");
      return;
    }
    if (totalOccupancy + newValue < 0) {
      setWarning(`No puedes retirar más personas de las que hay (${totalOccupancy} actualmente).`);
      return;
    }
    if (totalOccupancy + newValue > shelterDetails.capacity) {
      setWarning(`No puedes exceder la capacidad del albergue (${shelterDetails.capacity}).`);
      return;
    }

    try {
      const updated = await updateOcc(shelterId, { currentOccupancy: newValue });
      setNewOccupancy("");
      setWarning("");
      setSuccessMsg(
        newValue > 0
          ? `+${newValue} personas registradas correctamente.`
          : `${newValue} personas retiradas correctamente.`
      );
      setTimeout(() => setSuccessMsg(""), 2500);
      setLocalShelter((prev) => ({
        ...prev,
        occupancy: [...(prev.occupancy || []), updated],
      }));
      if (typeof window !== "undefined") window.dispatchEvent(new Event("occupancyUpdated"));
    } catch (err) {
      setWarning("Error al conectar con el servidor. Inténtalo de nuevo.");
      console.error("Error al actualizar ocupación:", err);
    }
  };

  return (
    <section className="flex-1 bg-white p-4 rounded-lg shadow-sm flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{shelterDetails.name}</h2>
          <p className="text-sm text-gray-500">{shelterDetails.address}</p>
          <p className="mt-1 text-sm">
            <strong>Municipio:</strong> {shelterDetails.municipality} &nbsp;•&nbsp;
            <strong>ID:</strong> {shelterDetails.id}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-gray-500">Capacidad</div>
          <div className="text-4xl font-bold">{shelterDetails.capacity}</div>
          <div className="text-xs text-gray-400">Ocupado: {totalOccupancy}</div>
        </div>
      </div>

      {/* Badge disponible */}
      <div>
        <span className={`px-2 py-1 rounded text-white text-xs ${shelterDetails.available ? "bg-green-500" : "bg-red-500"}`}>
          {shelterDetails.available ? "Disponible" : "No disponible"}
        </span>
      </div>

      {/* Barra de ocupación */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Ocupación actual</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct >= 90 && (
          <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
            <AlertTriangle size={12} /> Capacidad casi llena
          </div>
        )}
      </div>

      {/* Formulario */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Registrar personas</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={newOccupancy}
            onChange={(e) => setNewOccupancy(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUpdate(); } }}
            placeholder="Cantidad"
            className={`border rounded px-3 py-1.5 w-32 text-sm ${warning ? "border-red-500" : ""}`}
          />
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-60"
          >
            <RefreshCw size={13} className={updating ? "animate-spin" : ""} />
            {updating ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {/* Botones rápidos */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-gray-400">Accesos rápidos:</span>
          {[1, 2, 4].map((n) => (
            <button
              key={`+${n}`}
              onClick={() => setNewOccupancy(String(n))}
              className="px-2.5 py-1 rounded-full border text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors"
            >
              +{n}
            </button>
          ))}
          {[1, 2, 4].map((n) => (
            <button
              key={`-${n}`}
              onClick={() => setNewOccupancy(String(-n))}
              className="px-2.5 py-1 rounded-full border text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors"
            >
              −{n}
            </button>
          ))}
        </div>

        {warning && <p className="text-red-500 text-xs mt-2">{warning}</p>}
        {updateError && <p className="text-red-500 text-xs mt-2">Error al actualizar ocupación.</p>}
        {successMsg && <p className="text-green-600 text-xs mt-2">{successMsg}</p>}
      </div>

      {/* Empleados */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Users size={14} className="text-gray-500" />
          <span className="text-sm font-semibold">Empleados asignados ({organizers.length})</span>
        </div>
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="pb-1">Nombre</th>
              <th className="pb-1">Teléfono</th>
              <th className="pb-1">Correo</th>
            </tr>
          </thead>
          <tbody>
            {organizers.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-2 text-gray-400 text-center text-xs">Sin empleados asignados.</td>
              </tr>
            ) : (
              organizers.map((org, i) => (
                <tr key={i} className="border-t">
                  <td className="py-1.5">{org.userName}</td>
                  <td className="py-1.5">{org.phoneNumber}</td>
                  <td className="py-1.5">{org.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ─── Panel historial ─────────────────────────────────────── */
function HistorialPanel({ shelterId }) {
  const { data, loading, error, refetch } = getOccupancy();
  const listRef = useRef(null);

  useEffect(() => {
    const listener = () => refetch();
    window.addEventListener("occupancyUpdated", listener);
    return () => window.removeEventListener("occupancyUpdated", listener);
  }, [refetch]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [data]);

  const sorted = Array.isArray(data)
    ? data
        .filter((o) => o.shelterId === shelterId)
        .sort((a, b) => new Date(a.updatedOn) - new Date(b.updatedOn))
    : [];

  const latest = sorted[sorted.length - 1];
  const peak = sorted.reduce((max, e) => (e.currentOccupancy > max ? e.currentOccupancy : max), 0);

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString("es-MX", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  }

  function getDotColor(occ, idx) {
    if (idx === sorted.length - 1) return "bg-gray-400";
    const prev = sorted[idx - 1]?.currentOccupancy ?? occ.currentOccupancy;
    const delta = occ.currentOccupancy - prev;
    if (delta > 0) return "bg-green-500";
    if (delta < 0) return "bg-red-400";
    return "bg-gray-300";
  }

  function getValueColor(occ, idx) {
    if (idx === sorted.length - 1) return "text-gray-600";
    const prev = sorted[idx - 1]?.currentOccupancy ?? occ.currentOccupancy;
    const delta = occ.currentOccupancy - prev;
    if (delta > 0) return "text-green-700";
    if (delta < 0) return "text-red-600";
    return "text-gray-500";
  }

  return (
    <section className="w-72 shrink-0 bg-white p-4 rounded-lg shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-2 pb-2 border-b">
        <TrendingUp size={15} className="text-gray-500" />
        <h3 className="font-semibold text-sm">Historial de ocupación</h3>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
          <div className="text-2xl font-bold text-gray-800">{latest?.currentOccupancy ?? "—"}</div>
          <div className="text-xs text-gray-400">Actual</div>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
          <div className="text-2xl font-bold">{peak}</div>
          <div className="text-xs text-gray-400">Máximo registrado</div>
        </div>
      </div>

      {loading && <p className="text-gray-400 text-xs">Cargando...</p>}
      {error && <p className="text-red-400 text-xs">Error al cargar historial.</p>}
      {!loading && !error && sorted.length === 0 && (
        <p className="text-gray-400 text-xs text-center mt-2">Sin registros de ocupación.</p>
      )}

      {/* Timeline */}
      <div ref={listRef} className="overflow-y-auto flex-1 relative" style={{ maxHeight: "420px" }}>
        <div className="absolute left-[8px] top-1 bottom-1 w-px bg-gray-100" />
        <div className="flex flex-col">
          {[...sorted].reverse().map((occ, idx) => {
            const origIdx = sorted.length - 1 - idx;
            const isFirst = idx === 0;
            const dotColor = getDotColor(occ, origIdx);
            const valueColor = getValueColor(occ, origIdx);
            return (
              <div
                key={idx}
                className={`relative flex items-start pl-5 py-2 rounded-lg transition-colors ${isFirst ? "bg-indigo-50/50" : "hover:bg-gray-50"}`}
              >
                <div className={`absolute left-[4px] top-[13px] w-[9px] h-[9px] rounded-full border-2 border-white ${dotColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${valueColor}`}>
                      {occ.currentOccupancy}
                      <span className="text-sm font-normal ml-1 text-gray-400">personas</span>
                    </span>
                    {isFirst && (
                      <span className="text-sm px-2 py-0.5 rounded-full border">
                        Reciente
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">{formatTime(occ.updatedOn)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Dashboard principal ─────────────────────────────────── */
export default function ShelterDashboardOrganizer() {
  const { data: shelters, loading, error } = getShelters();
  const userName = localStorage.getItem("userName") || "";
  const firstShelter = shelters && shelters.length > 0 ? shelters[0] : null;

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      <OrganizerSidebar />

      <main className="flex-1 p-6 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-bold text-2xl">Bienvenido: {userName}</h1>
          <h2 className="text-xl text-gray-500">Mi refugio</h2>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
            Cargando información...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-40 text-red-400 text-sm">
            Error al cargar el refugio.
          </div>
        )}

        {firstShelter && (
          <div className="flex gap-6 flex-1">
            <ShelterDetailPanel shelter={firstShelter} />
            <HistorialPanel shelterId={firstShelter.id} />
          </div>
        )}
      </main>
    </div>
  );
}