import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getShelters } from "../api/Requests/shelter/GetSheltersHook";
import { useEffect, useState } from "react";
import { ShelterviewModal } from "./SheltersViewModal";
import L from "leaflet";
import { useLocation } from "react-router-dom";
import { GetMyShelter } from "../api/Requests/shelter/GetMyShelterHook";
import LocateButton from "./LocateButton";
 
const centerPosition = [21.1619, -86.8515];
 
export default function MapView({ size = "normal" }) {
  const location = useLocation();
 
  const { data: shelters = [], loading, error } = getShelters();
  const [selectedShelterId, setSelectedShelterId] = useState(null);
  const [userLocation, setUserLocation] = useState([21.1619, -86.8515]);
  const [click, setClick] = useState(false);
 
  const maxBounds = [
    [14.5, -118.5], // Suroeste
    [32.7, -86.5],  // Noreste
  ];
 
  const containerClass =
    size === "small"
      ? "relative w-full h-80"
      : "relative w-full h-[88vh]";
 
  useEffect(() => {
    const state = location.state;
    if (state?.click) {
      setClick(!click);
    }
  }, [location.state]);
 
  return (
    <div className={containerClass}>
      <MapContainer
        center={userLocation || centerPosition}
        zoom={12}
        minZoom={6}
        maxZoom={18}
        maxBounds={maxBounds}
        maxBoundsViscosity={0.8}
        scrollWheelZoom={true}
        className="w-full h-full rounded-xl shadow-lg z-0"
      >
        <TileLayer
          url="https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=eXmdw7WKLv2CUAXF3M2f0K0UIKX0ViJK1aMRJ3mHLICN7PxjJ8YCZgw1OQ3b6GNl"
          attribution='&copy; JawgMaps &copy; OpenStreetMap contributors'
        />
        <TileLayer
          url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=dda3c2996fee2dfc91267e3649c6832a`}
          opacity={0.6}
          attribution='&copy; OpenWeatherMap'
        />
 
        <LocateButton onLocation={setUserLocation} setId={(id) => { setSelectedShelterId(id); }} />
 
        {/* Marcador de la ubicación del usuario */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: "user-location",
              html: `<div class="user-location-dot"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            })}
          >
            <Popup>Estás aquí</Popup>
          </Marker>
        )}
 
        {/* Localizar albergue más cercano y hacer flyTo */}
        {userLocation && (
          <NearestShelterLocator
            click={click}
            userLocation={userLocation}
            setSelectedShelterId={setSelectedShelterId}
          />
        )}
 
        {/* Marcadores de todos los albergues */}
        {(shelters || []).map((m, i) => (
          <Marker
            key={i}
            position={[m.latitude, m.longitude]}
            eventHandlers={{
              click: () => {
                setSelectedShelterId(m.id);
              },
            }}
          >
            <Popup>{m.name}</Popup>
          </Marker>
        ))}
 
        {/* Modal de detalle del albergue */}
        <ShelterviewModal
          id={selectedShelterId}
          setId={() => setSelectedShelterId(null)}
        />
      </MapContainer>
    </div>
  );
}
 
function NearestShelterLocator({ click, userLocation, setSelectedShelterId }) {
  const map = useMap();
  const [alreadyCentered, setAlreadyCentered] = useState(false);
 
  const lat = userLocation?.[0];
  const lon = userLocation?.[1];
 
  const { data: nearest, loading, error } = GetMyShelter(lat, lon);
 
  useEffect(() => {
    if (!click) return;
    if (!lat || !lon) return;
    if (loading || error) return;
    if (!nearest || !nearest.shelter) return;
    if (alreadyCentered) return;
 
    const shelter = nearest.shelter;
    setSelectedShelterId(shelter.id);
    map.flyTo([shelter.latitude, shelter.longitude], 16);
    setAlreadyCentered(true);
  }, [lat, lon, loading, error, nearest, map, alreadyCentered, setSelectedShelterId]);
 
  return null;
}