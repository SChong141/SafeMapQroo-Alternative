import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCreateShelter } from "../api/Requests/shelter/CreateShelterHook";

export default function RegisterModal({ onClose, onCreate }) {
  const [newShelter, setNewShelter] = useState({
    name: "",
    address: "",
    capacity: "",
    lat: "",
    lng: "",
    municipality: 0,
    available: true,
  });

  const { loading, createShelter } = useCreateShelter();

  async function handleCreateShelter(e) {
    e.preventDefault();
    if (!newShelter.name) {
      return alert("El nombre del refugio es requerido");
    }

    const payload = {
      name: newShelter.name,
      address: newShelter.address,
      capacity: Number(newShelter.capacity) || 0,
      latidude: newShelter.lat ? Number(newShelter.lat) : 0,
      longitude: newShelter.lng ? Number(newShelter.lng) : 0,
      municipality: Number(newShelter.municipality),
      available: newShelter.available,
    };

    try {
      const createdShelter = await createShelter(payload);
      onCreate(createdShelter);
      onClose();
    } catch (err) {
      console.error("Error creando refugio:", err);
      alert("No fue posible crear el refugio en el servidor.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <motion.form
        onSubmit={handleCreateShelter}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-lg p-6 shadow-2xl text-lg"
      >
        <h3 className="text-lg font-semibold mb-4">Registrar nuevo refugio</h3>

        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Nombre"
            value={newShelter.name}
            onChange={(e) => setNewShelter((p) => ({ ...p, name: e.target.value }))}
            className="px-3 py-2 rounded border col-span-2"
          />

          <input
            placeholder="Dirección"
            value={newShelter.address}
            onChange={(e) => setNewShelter((p) => ({ ...p, address: e.target.value }))}
            className="px-3 py-2 rounded border col-span-2"
          />

          <input
            placeholder="Capacidad"
            type="number"
            value={newShelter.capacity}
            onChange={(e) => setNewShelter((p) => ({ ...p, capacity: e.target.value }))}
            className="px-3 py-2 rounded border col-span-1"
          />

          <select
            value={newShelter.municipality}
            onChange={(e) => setNewShelter((p) => ({ ...p, municipality: e.target.value }))}
            className="px-3 py-2 rounded border col-span-1"
          >
            <option value={0}>Cozumel</option>
            <option value={1}>Felipe Carrillo Puerto</option>
            <option value={2}>Isla Mujeres</option>
            <option value={3}>Othón P. Blanco</option>
            <option value={4}>Benito Juárez (Cancún)</option>
            <option value={5}>José María Morelos</option>
            <option value={6}>Lázaro Cárdenas</option>
            <option value={7}>Playa Del Carmen</option>
            <option value={8}>Tulum</option>
            <option value={9}>Bacalar</option>
            <option value={10}>Puerto Morelos</option>
          </select>

          <input
            placeholder="Latitud"
            type="number"
            step="any"
            value={newShelter.lat}
            onChange={(e) => setNewShelter((p) => ({ ...p, lat: e.target.value }))}
            className="px-3 py-2 rounded border col-span-1"
          />

          <input
            placeholder="Longitud"
            type="number"
            step="any"
            value={newShelter.lng}
            onChange={(e) => setNewShelter((p) => ({ ...p, lng: e.target.value }))}
            className="px-3 py-2 rounded border col-span-1"
          />

          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={newShelter.available}
              onChange={(e) => setNewShelter((p) => ({ ...p, available: e.target.checked }))}
            />
            <label htmlFor="available" className="text-sm">Disponible</label>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded border"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            {loading ? "Guardando..." : "Crear refugio"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
