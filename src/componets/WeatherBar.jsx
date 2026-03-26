import { useState, useEffect } from "react";

const OWM_KEY = "dda3c2996fee2dfc91267e3649c6832a";

const CONDITION_MAP = {
  Thunderstorm: { label: "Tormenta eléctrica", icon: "⛈", alert: true  },
  Drizzle:      { label: "Llovizna",            icon: "🌦", alert: false },
  Rain:         { label: "Lluvia",              icon: "🌧", alert: false },
  Snow:         { label: "Nieve",               icon: "❄️", alert: false },
  Mist:         { label: "Neblina",             icon: "🌫", alert: false },
  Fog:          { label: "Niebla",              icon: "🌫", alert: false },
  Haze:         { label: "Bruma",               icon: "🌫", alert: false },
  Dust:         { label: "Polvo",               icon: "🌪", alert: true  },
  Sand:         { label: "Arena",               icon: "🌪", alert: true  },
  Squall:       { label: "Chubascos",           icon: "💨", alert: true  },
  Tornado:      { label: "Tornado",             icon: "🌪", alert: true  },
  Clear:        { label: "Despejado",           icon: "☀️", alert: false },
  Clouds:       { label: "Nublado",             icon: "☁️", alert: false },
};

const CANCUN_COORDS = [21.1619, -86.8515];

export default function WeatherBar() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function fetchWeather(lat, lon) {
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${OWM_KEY}`
      )
        .then((r) => r.json())
        .then((d) => {
          if (d.cod !== 200) throw new Error("bad response");
          const main = d.weather?.[0]?.main ?? "Clear";
          const cond = CONDITION_MAP[main] ?? {
            label: d.weather?.[0]?.description ?? "—",
            icon: "🌡",
            alert: false,
          };
          setWeather({
            temp: Math.round(d.main.temp),
            condition: cond.label,
            icon: cond.icon,
            alert: cond.alert,
            wind: Math.round(d.wind.speed * 3.6),
            city: d.name,
          });
        })
        .catch(() => setWeather(null))
        .finally(() => setLoading(false));
    }

    if (!navigator.geolocation) {
      fetchWeather(...CANCUN_COORDS);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      ()    => fetchWeather(...CANCUN_COORDS),
      { timeout: 5000 }
    );
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-[#0f172a]/90 px-4 py-1.5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse inline-block" />
        <span className="text-white/40 text-xs">Cargando clima...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="w-full bg-[#0f172a]/90 px-4 py-1.5 flex items-center gap-4 flex-wrap">

      {/* Temperatura + condición */}
      <span className="text-white text-xs flex items-center gap-1.5">
        <span style={{ fontSize: "14px" }}>{weather.icon}</span>
        <strong className="text-white">{weather.temp}°C</strong>
        <span className="text-white/40">·</span>
        <span className="text-white/80">{weather.condition}</span>
      </span>

      <span className="text-white/20 text-xs hidden sm:inline">|</span>

      {/* Viento */}
      <span className="text-white/70 text-xs flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(255,255,255,0.4)" }}>
          <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
          <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
          <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
        </svg>
        {weather.wind} km/h
      </span>

      <span className="text-white/20 text-xs hidden sm:inline">|</span>

      {/* Ciudad */}
      <span className="text-white/40 text-xs">{weather.city}</span>

      {/* Badge alerta */}
      <div className="ml-auto">
        {weather.alert ? (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(220,38,38,0.2)", color: "#ffffff", border: "0.5px solid rgba(240, 43, 43, 0.4)" }}>
            ⚠ Alerta meteorológica activa
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(22,163,74,0.2)", color: "#ffffff", border: "0.5px solid rgba(24, 219, 96, 0.3)" }}>
            Sin alertas activas
          </span>
        )}
      </div>

    </div>
  );
}
