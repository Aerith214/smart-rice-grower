import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const CENTER: [number, number] = [121.1439, 16.4841]; // lng, lat

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

type GeocodeFeature = {
  center: [number, number];
  text: string;
  place_name: string;
};

type GeocodeResponse = {
  features: GeocodeFeature[];
};

const tokenKey = "mapbox_public_token";

const MapboxBayombong: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(tokenKey));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveToken = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    localStorage.setItem(tokenKey, trimmed);
    setToken(trimmed);
  };

  useEffect(() => {
    if (!mapContainer.current || !token) return;
    setError(null);

    mapboxgl.accessToken = token;
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: CENTER,
      zoom: 12.2,
      pitch: 0,
      attributionControl: true,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

    // Load barangay markers via Mapbox Geocoding
    const abort = new AbortController();
    (async () => {
      try {
        setPending(true);
        const results = await Promise.all(
          BARANGAYS.map(async (name) => {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              placeQuery(name)
            )}.json?limit=1&access_token=${encodeURIComponent(token)}`;
            const res = await fetch(url, { signal: abort.signal });
            if (!res.ok) throw new Error("Geocoding failed");
            const json = (await res.json()) as GeocodeResponse;
            const feature = json.features?.[0];
            return feature ? { name, center: feature.center as [number, number], place: feature.place_name } : null;
          })
        );

        results.filter(Boolean).forEach((r) => {
          if (!r || !mapRef.current) return;
          const el = document.createElement("div");
          el.className = "flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow ring-1 ring-border";
          el.style.width = "20px";
          el.style.height = "20px";
          el.style.cursor = "pointer";

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat(r.center)
            .setPopup(
              new mapboxgl.Popup({ offset: 12 }).setHTML(
                `<strong>${r.name}</strong><br/><span style="font-size:12px;opacity:.7">${r.place}</span>`
              )
            )
            .addTo(mapRef.current);

          // Optional: center on marker click
          el.addEventListener("click", () => {
            mapRef.current?.easeTo({ center: r.center, zoom: 13.5, duration: 800 });
          });
        });
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message || "Failed to load markers");
      } finally {
        setPending(false);
      }
    })();

    return () => {
      abort.abort();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  const [input, setInput] = useState("");

  return (
    <div className="relative w-full min-h-[70vh]">
      {!token && (
        <div className="mb-4 rounded-md border bg-card p-4">
          <h2 className="mb-1 text-lg font-medium">Mapbox Token Required</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Please enter your Mapbox public token to load the interactive map. Find it in your Mapbox
            dashboard under Tokens. You can also store it as a Supabase Edge Function Secret later.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="pk.eyJ..."
              className="w-full rounded-md border bg-background px-3 py-2"
            />
            <button
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
              onClick={() => handleSaveToken(input)}
            >
              Save token
            </button>
          </div>
        </div>
      )}

      <div ref={mapContainer} className="relative h-[70vh] w-full rounded-lg shadow" />

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

export default MapboxBayombong;
