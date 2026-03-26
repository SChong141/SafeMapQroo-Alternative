// src/components/ShelterOccupancyDetail.jsx
import React, { useEffect, useRef, useMemo } from "react";
import { getOccupancy } from "../api/Requests/occupancy/GetOccupancyHook";

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEntryStyle(delta) {
  if (delta > 0)
    return {
      dot: "bg-green-500",
      badge: "bg-green-50 text-green-700 border border-green-200",
      value: "text-green-700",
      label: "Ingreso",
      labelColor: "text-green-600",
    };
  if (delta < 0)
    return {
      dot: "bg-red-400",
      badge: "bg-red-50 text-red-700 border border-red-200",
      value: "text-red-600",
      label: "Salida",
      labelColor: "text-red-500",
    };
  return {
    dot: "bg-gray-300",
    badge: "bg-gray-50 text-gray-500 border border-gray-200",
    value: "text-gray-500",
    label: "Sin cambio",
    labelColor: "text-gray-400",
  };
}

export default function ShelterOccupancyDetail({ shelterId }) {
  const { data, loading, error, refetch } = getOccupancy();
  const listRef = useRef(null);

  useEffect(() => {
    const listener = () => refetch();
    window.addEventListener("occupancyUpdated", listener);
    return () => window.removeEventListener("occupancyUpdated", listener);
  }, [refetch]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data
      .filter((occ) => occ.shelterId === shelterId)
      .sort((a, b) => new Date(a.updatedOn) - new Date(b.updatedOn));
  }, [data, shelterId]);

  const enriched = useMemo(() => {
    return filtered.map((occ, i) => {
      const prev = i > 0 ? filtered[i - 1].currentOccupancy : occ.currentOccupancy;
      const delta = occ.currentOccupancy - prev;
      return { ...occ, delta: i === 0 ? 0 : delta };
    });
  }, [filtered]);

  const latest = enriched[enriched.length - 1];
  const peak = enriched.reduce(
    (max, e) => (e.currentOccupancy > max ? e.currentOccupancy : max),
    0
  );
  const totalChanges = enriched.filter((e) => e.delta !== 0).length;

  if (loading)
    return (
      <div className="flex items-center justify-center py-10 text-gray-400 text-sm gap-2">
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Cargando historial...
      </div>
    );

  if (error)
    return (
      <div className="py-6 text-center text-red-500 text-sm">
        Error al cargar los datos de ocupación.
      </div>
    );

  if (filtered.length === 0)
    return (
      <div className="py-10 text-center text-gray-400 text-sm">
        <svg className="mx-auto mb-2 w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Sin registros de ocupación para este refugio.
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center">
          <div className="text-2xl font-bold text-gray-800">
            {latest?.currentOccupancy ?? "—"}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Ocupación actual</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center">
          <div className="text-2xl font-bold">{peak}</div>
          <div className="text-xs text-gray-400 mt-0.5">Máximo registrado</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-center">
          <div className="text-2xl font-bold">{totalChanges}</div>
          <div className="text-xs text-gray-400 mt-0.5">Movimientos</div>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={listRef}
        className="overflow-y-auto max-h-72 pr-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
      >
        <div className="relative">
          <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gray-100" />
          <div className="flex flex-col gap-0">
            {[...enriched].reverse().map((occ, idx) => {
              const style = getEntryStyle(occ.delta);
              const isFirst = idx === 0;
              return (
                <div
                  key={idx}
                  className={`relative flex items-start gap-3 pl-10 py-2.5 rounded-lg transition-colors ${
                    isFirst ? "bg-indigo-50/60" : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`absolute left-[13px] top-[14px] w-[11px] h-[11px] rounded-full border-2 border-white shadow-sm ${style.dot}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-base font-bold ${style.value}`}>
                        {occ.currentOccupancy}
                        <span className="text-xs font-normal ml-1 text-gray-400">personas</span>
                      </span>
                      {isFirst && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium border">
                          Más reciente
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-medium ${style.labelColor}`}>
                        {style.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(occ.updatedOn)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}