import React, { useState } from "react";
import { getOneShelters } from "../api/Requests/shelter/GetOneShelterHook";
import { updateShelter as useUpdateShelter } from "../api/Requests/shelter/UpdateShelterHook";
import { useDeleteShelter } from "../api/Requests/shelter/DeleteShelterHook";

const MUNICIPALITIES = [
  { value: 0, label: "Cozumel" },
  { value: 1, label: "Felipe Carrillo Puerto" },
  { value: 2, label: "Isla Mujeres" },
  { value: 3, label: "Othón P. Blanco" },
  { value: 4, label: "Benito Juárez (Cancún)" },
  { value: 5, label: "José María Morelos" },
  { value: 6, label: "Lázaro Cárdenas" },
  { value: 7, label: "Playa Del Carmen" },
  { value: 8, label: "Tulum" },
  { value: 9, label: "Bacalar" },
  { value: 10, label: "Puerto Morelos" },
];

export default function ShelterDetail({ shelter }) {
  const shelterId = shelter?.id;
  const { data, loading, error } = getOneShelters(shelterId);
  const { updateShelter } = useUpdateShelter();
  const { deleteShelter } = useDeleteShelter();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    capacity: "",
    latidude: "",
    longitude: "",
    municipality: 0,
    available: true,
  });

  const BlockMessage = ({ text }) => (
    <div className="col-span-1 flex items-center justify-center bg-white p-4 rounded-lg shadow-sm">
      <div className="bg-gray-100 text-gray-700 px-6 py-4 rounded-lg shadow text-center text-sm">
        {text}
      </div>
    </div>
  );

  if (!shelterId) return <BlockMessage text="Selecciona un refugio para ver los detalles..." />;
  if (loading) return <BlockMessage text="Cargando información del refugio..." />;
  if (error) return <BlockMessage text="Error al obtener los datos del refugio..." />;
  if (!data) return <BlockMessage text="No se encontraron datos del refugio..." />;

  const shelterDetails = data;
  const organizerSize = Array.isArray(shelterDetails.organizer)
    ? shelterDetails.organizer.length
    : shelterDetails.organizer ? 1 : 0;
  const organizers = Array.isArray(shelterDetails.organizer)
    ? shelterDetails.organizer
    : shelterDetails.organizer ? [shelterDetails.organizer] : [];

  // Obtener número del municipio desde el string del enum
  function getMunicipalityNumber(municipalityValue) {
    if (typeof municipalityValue === "number") return municipalityValue;
    const found = MUNICIPALITIES.find(
      (m) => m.label.toLowerCase() === String(municipalityValue).toLowerCase()
    );
    return found ? found.value : 0;
  }

  function handleOpenEdit() {
    setEditForm({
      name: shelterDetails.name ?? "",
      address: shelterDetails.address ?? "",
      capacity: shelterDetails.capacity ?? "",
      latidude: shelterDetails.latitude ?? "",
      longitude: shelterDetails.longitude ?? "",
      municipality: getMunicipalityNumber(shelterDetails.municipality),
      available: shelterDetails.available === true,
    });
    setShowEditModal(true);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    try {
      await updateShelter(shelterId, {
        name: editForm.name,
        address: editForm.address,
        capacity: Number(editForm.capacity),
        latidude: Number(editForm.latidude),
        longitude: Number(editForm.longitude),
        municipality: Number(editForm.municipality),
        available: Boolean(editForm.available),
      });
      setShowEditModal(false);
      alert("Refugio actualizado correctamente. Recarga para ver los cambios.");
    } catch (err) {
      alert("Error al actualizar el refugio.");
      console.error(err);
    }
  }

  async function handleDelete() {
    const first = confirm("¿Estás seguro que deseas eliminar este refugio?");
    if (!first) return;
    const second = confirm("Esta acción es irreversible. ¿Confirmas la eliminación?");
    if (!second) return;
    try {
      await deleteShelter(shelterId);
      setShowEditModal(false);
      alert("Refugio eliminado correctamente. Recarga para ver los cambios.");
    } catch (err) {
      alert("Error al eliminar el refugio.");
      console.error(err);
    }
  }

  const municipalityLabel = MUNICIPALITIES.find(
    (m) => m.value === getMunicipalityNumber(shelterDetails.municipality)
  )?.label ?? shelterDetails.municipality;

  return (
    <section className="col-span-1 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{shelterDetails.name}</h2>
          <div className="text-sm text-gray-500">{shelterDetails.address}</div>
          <div className="mt-2 text-sm">
            <strong>Municipio:</strong> {municipalityLabel} •{" "}
            <strong>ID:</strong> {shelterDetails.id}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm">Capacidad</div>
          <div className="text-2xl font-bold">{shelterDetails.capacity}</div>
          <div className="text-sm text-gray-500">
            Ocupado: {shelterDetails.occupied}
          </div>
        </div>
      </div>

      <div className="mt-2 text-sm">
        <span className={`px-2 py-1 rounded text-white text-xs ${shelterDetails.available ? "bg-green-500" : "bg-red-500"}`}>
          {shelterDetails.available ? "Disponible" : "No disponible"}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleOpenEdit}
          className="px-3 py-1 rounded-md border hover:bg-gray-100"
        >
          Editar
        </button>
        <button className="px-3 py-1 rounded-md border">Agregar empleado</button>
        <button className="px-3 py-1 rounded-md border">Ver historial</button>
      </div>

      <div className="mt-6">
        <div className="font-semibold mb-2">
          Empleados asignados ({organizerSize})
        </div>
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="pb-2">Nombre</th>
              <th className="pb-2">Numero</th>
              <th className="pb-2">Correo</th>
            </tr>
          </thead>
          <tbody>
            {organizers.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-3 text-gray-500 text-center">
                  No hay organizadores asignados.
                </td>
              </tr>
            ) : (
              organizers.map((org, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2">{org.userName}</td>
                  <td className="py-2">{org.phoneNumber}</td>
                  <td className="py-2">{org.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowEditModal(false)}
          />
          <form
            onSubmit={handleSaveEdit}
            className="relative z-10 w-full max-w-lg bg-white rounded-lg p-6 shadow-2xl"
          >
            <h3 className="text-lg font-semibold mb-4">Editar refugio</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Nombre"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className="px-3 py-2 rounded border col-span-2"
              />
              <input
                placeholder="Dirección"
                value={editForm.address}
                onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                className="px-3 py-2 rounded border col-span-2"
              />
              <input
                placeholder="Capacidad"
                type="number"
                value={editForm.capacity}
                onChange={(e) => setEditForm((p) => ({ ...p, capacity: e.target.value }))}
                className="px-3 py-2 rounded border col-span-1"
              />
              <select
                value={editForm.municipality}
                onChange={(e) => setEditForm((p) => ({ ...p, municipality: e.target.value }))}
                className="px-3 py-2 rounded border col-span-1"
              >
                {MUNICIPALITIES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <input
                placeholder="Latitud"
                type="number"
                step="any"
                value={editForm.latidude}
                onChange={(e) => setEditForm((p) => ({ ...p, latidude: e.target.value }))}
                className="px-3 py-2 rounded border col-span-1"
              />
              <input
                placeholder="Longitud"
                type="number"
                step="any"
                value={editForm.longitude}
                onChange={(e) => setEditForm((p) => ({ ...p, longitude: e.target.value }))}
                className="px-3 py-2 rounded border col-span-1"
              />
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={editForm.available}
                  onChange={(e) => setEditForm((p) => ({ ...p, available: e.target.checked }))}
                />
                <label htmlFor="available" className="text-sm">Disponible</label>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 text-white mr-auto"
              >
                Eliminar refugio
              </button>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-3 py-2 rounded border"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}