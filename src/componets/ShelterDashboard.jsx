// src/components/ShelterDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Home, Shield, LogOut, MapPin, Search, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ShelterList from "./ShelterList";
import ShelterDetail from "./ShelterDetail";
import RegisterModal from "./RegisterModal";
import MapView from "./MapView";
import { getShelters } from "../api/Requests/shelter/GetSheltersHook";

/* ─── Sidebar Admin ───────────────────────────────────────── */
function AdminSidebar() {
  const userName = localStorage.getItem("userName") || "Admin";
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <aside
      style={{ background: "linear-gradient(180deg, #6B1A2A 0%, #8B2535 60%, #7A1F2E 100%)" }}
      className="w-64 flex flex-col shadow-2xl shrink-0"
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
        <p className="text-white/40 text-xs pl-11">Panel de administración</p>
      </div>

      {/* User card */}
      <div className="mx-4 mt-5 mb-2 bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-300 to-rose-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="overflow-hidden">
          <div className="text-white text-sm font-semibold truncate">{userName}</div>
          <div className="text-white/50 text-xs">Administrador</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        <p className="text-white/30 text-xs uppercase tracking-widest px-3 mb-2">Menú</p>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/15 text-white cursor-pointer transition-all">
          <Home size={16} className="text-red-300" />
          <span className="text-sm font-medium">Resumen</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-300"></span>
        </a>
        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white cursor-pointer transition-all">
          <MapPin size={16} />
          <span className="text-sm">Refugios</span>
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

/* ─── Dashboard principal ─────────────────────────────────── */
export default function ShelterDashboard() {
  const { data: shelters } = getShelters();

  const [localShelters, setLocalShelters] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    if (shelters && shelters.length > 0) {
      setLocalShelters(shelters);
      setSelected((prev) => prev || shelters[0]);
    }
  }, [shelters]);

  const filteredShelters = useMemo(() => {
    if (!query) return localShelters;
    const q = query.toLowerCase();
    return localShelters.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.address || "").toLowerCase().includes(q) ||
        (s.id || "").toLowerCase().includes(q)
    );
  }, [localShelters, query]);

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      <AdminSidebar />

      <main className="flex-1 flex flex-col p-6 min-w-0">
        {/* Header */}
        <div className="mb-1">
          <h1 className="font-bold text-2xl">Bienvenido: {localStorage.getItem("userName") || ""}</h1>
        </div>

        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Refugios</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar refugio, dirección o ID"
                className="pl-9 pr-3 py-2 rounded-md border w-72 text-sm"
              />
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
            >
              <PlusCircle size={15} />
              Registrar refugio
            </button>
          </div>
        </header>

        {/* Grid: lista | detalle | mapa */}
        <div className="grid grid-cols-3 gap-6 flex-1">
          <ShelterList
            selected={selected}
            onSelect={setSelected}
            shelters={filteredShelters}
          />

          <ShelterDetail
            shelter={selected}
            updateShelter={(s) =>
              setLocalShelters((prev) => prev.map((p) => (p.id === s.id ? s : p)))
            }
          />

          {/* Mapa */}
          <section className="col-span-1 bg-white p-4 rounded-lg shadow-sm flex flex-col gap-3">
            <div className="font-semibold text-sm">Mapa de refugios</div>
            <div className="flex-1 rounded-lg overflow-hidden" style={{ minHeight: "320px" }}>
              <MapView size="small" />
            </div>
          </section>
        </div>
      </main>

      {showRegisterModal && (
        <RegisterModal
          onClose={() => setShowRegisterModal(false)}
          onCreate={(created) => {
            setLocalShelters((prev) => [created, ...prev]);
            setSelected(created);
          }}
        />
      )}
    </div>
  );
}