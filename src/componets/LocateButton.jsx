import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";
import { GetMyShelter } from "../api/Requests/shelter/GetMyShelterHook";

export default function LocateButton({ onLocation, setId }) {
  const map = useMap();
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lon: null });

  const { data: shelters, loading: sheltersLoading } = GetMyShelter(coords.lat, coords.lon);

  useEffect(() => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("La geolocalización no es soportada por este navegador.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log("Ubicación real:", lat, lon);
        onLocation([lat, lon]);
        setCoords({ lat, lon });
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener ubicación:", error);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 100000,
      }
    );
  }, []);

  const handleLocate = () => {
    if (!shelters?.shelter) {
      alert("Aún no se encontró un refugio cercano.");
      return;
    }
    setId(shelters.shelter.id);
    map.flyTo([shelters.shelter.latitude, shelters.shelter.longitude], 14);
  };

  return (
    <button
      onClick={handleLocate}
      className="text-lg absolute top-5 right-5 bg-pink-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-800 z-[1000]"
    >
      {sheltersLoading ? "Buscando..." : "Buscar refugio más cercano"}
    </button>
  );
}