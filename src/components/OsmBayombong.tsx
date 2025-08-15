import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default marker icon paths for Vite bundling
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Coordinates for Bayombong town center (lat, lng)
const CENTER: [number, number] = [16.4841, 121.1439];

const BARANGAYS = [
  "Bansing",
  "Bonfal East",
  "Bonfal Proper",
  "Bonfal West",
  "Buenavista",
  "Busilac",
  "Cabuaan",
  "Casat",
  "District III Poblacion",
  "District IV",
  "Don Domingo Maddela Poblacion",
  "Don Mariano Marcos",
  "Don Tomas Maddela Poblacion",
  "Ipil-Cuneg",
  "La Torre North",
  "La Torre South",
  "Luyang",
  "Magapuy",
  "Magsaysay",
  "Masoc",
  "Paitan",
  "Salvacion",
  "San Nicolas North",
  "Santa Rosa",
  "Vista Alegre",
];

const placeQuery = (name: string) => `${name}, Bayombong, Nueva Vizcaya, Philippines`;

type NominatimItem = {
  lat: string;
  lon: string;
  display_name: string;
};

type MarkerData = {
  name: string;
  lat: number;
  lon: number;
  display: string;
};

function RecenterOnClick({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 13.5, { animate: true });
  }, [lat, lon, map]);
  return null;
}

const OsmBayombong: React.FC = () => {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      setPending(true);
      setError(null);
      try {
        const results = await Promise.all(
          BARANGAYS.map(async (name) => {
            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
              placeQuery(name)
            )}`;
            const res = await fetch(url, {
              signal: abort.signal,
              headers: {
                // Nominatim uses the Referer header from the browser; custom User-Agent is restricted in browsers
                Accept: "application/json",
              },
            });
            if (!res.ok) throw new Error("Geocoding failed");
            const json = (await res.json()) as NominatimItem[];
            const item = json[0];
            if (!item) return null;
            return {
              name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              display: item.display_name,
            } as MarkerData;
          })
        );
        setMarkers(results.filter(Boolean) as MarkerData[]);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load markers");
      } finally {
        setPending(false);
      }
    })();

    return () => abort.abort();
  }, []);

  const center = useMemo(() => CENTER, []);

  return (
    <div className="relative w-full min-h-[70vh]">
      <MapContainer
        center={center}
        zoom={12.2}
        scrollWheelZoom
        className="relative h-[70vh] w-full rounded-lg shadow"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((m) => (
          <div key={`${m.name}-${m.lat}-${m.lon}`}>
            <Circle
              center={[m.lat, m.lon]}
              radius={500}
              pathOptions={{
                color: 'hsl(var(--primary))',
                fillColor: 'hsl(var(--primary))',
                fillOpacity: 0.3,
                weight: 2,
              }}
              eventHandlers={{
                click: () => setFocus({ lat: m.lat, lon: m.lon }),
              }}
            >
              <Popup>
                <strong>{m.name}</strong>
                <br />
                <span className="text-sm opacity-70">{m.display}</span>
              </Popup>
            </Circle>
            <Marker position={[m.lat, m.lon]} eventHandlers={{
              click: () => setFocus({ lat: m.lat, lon: m.lon }),
            }}>
              <Popup>
                <strong>{m.name}</strong>
                <br />
                <span className="text-sm opacity-70">{m.display}</span>
              </Popup>
            </Marker>
          </div>
        ))}

        {focus && <RecenterOnClick lat={focus.lat} lon={focus.lon} />}
      </MapContainer>

      {pending && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="rounded-md bg-background/80 px-3 py-1 text-sm shadow">Loading markers…</div>
        </div>
      )}
      {error && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2">
          <div className="rounded-md bg-destructive px-3 py-1 text-destructive-foreground shadow">
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default OsmBayombong;
