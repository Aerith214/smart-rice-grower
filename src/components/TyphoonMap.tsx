import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Circle, Popup, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";

// Fix for default marker icon in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Xweather API credentials
const XWEATHER_CLIENT_ID = "PEQI96eDyoKy0pQAIqape";
const XWEATHER_CLIENT_SECRET = "HSGSNhrhpqt3usFU67PQ6cL5dgqS9rDx752fRtXH";

interface TropicalPosition {
  lat: number;
  lon: number;
  timestamp: number;
}

interface TropicalForecast {
  lat: number;
  lon: number;
  timestamp: number;
  category?: string;
}

interface TropicalCyclone {
  id: string;
  name: string;
  basin: string;
  category: string;
  position: {
    lat: number;
    lon: number;
    timestamp: number;
  };
  movement: {
    dirDEG: number;
    speedKPH: number;
  };
  wind: {
    maxKTS: number;
    maxKPH: number;
  };
  pressure: {
    mb: number;
  };
  track?: TropicalPosition[];
  forecast?: TropicalForecast[];
}

// Component to fit map bounds to cyclones
const FitBounds = ({ cyclones }: { cyclones: TropicalCyclone[] }) => {
  const map = useMap();

  useEffect(() => {
    if (cyclones.length > 0) {
      const bounds: [number, number][] = [];
      cyclones.forEach((cyclone) => {
        bounds.push([cyclone.position.lat, cyclone.position.lon]);
        cyclone.track?.forEach((point) => bounds.push([point.lat, point.lon]));
        cyclone.forecast?.forEach((point) => bounds.push([point.lat, point.lon]));
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
      }
    }
  }, [cyclones, map]);

  return null;
};

const TyphoonMap = () => {
  const [cyclones, setCyclones] = useState<TropicalCyclone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTyphoonData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tropical cyclones data with track and forecast
        const response = await fetch(
          `https://data.api.xweather.com/tropicalcyclones?client_id=${XWEATHER_CLIENT_ID}&client_secret=${XWEATHER_CLIENT_SECRET}&filter=active&limit=20&fields=id,name,basin,position,movement,wind,pressure,category&include=track,forecast`
        );

        if (!response.ok) {
          try {
            const errJson = await response.json();
            const desc = errJson?.error?.description || `API Error: ${response.status}`;
            throw new Error(desc);
          } catch {
            throw new Error(`API Error: ${response.status}`);
          }
        }

        const data = await response.json();

        if (data.success && data.response && data.response.length > 0) {
          const formattedCyclones: TropicalCyclone[] = data.response.map((item: any) => ({
            id: item.id || item.name,
            name: item.name || "Unknown",
            basin: item.basin || "Unknown",
            category: item.category || "Unknown",
            position: {
              lat: item.position?.lat || 0,
              lon: item.position?.lon || 0,
              timestamp: item.position?.timestamp || Date.now() / 1000,
            },
            movement: {
              dirDEG: item.movement?.dirDEG || 0,
              speedKPH: item.movement?.speedKPH || 0,
            },
            wind: {
              maxKTS: item.wind?.maxKTS || 0,
              maxKPH: item.wind?.maxKPH || 0,
            },
            pressure: {
              mb: item.pressure?.mb || 0,
            },
            track: item.track?.positions || [],
            forecast: item.forecast?.positions || [],
          }));

          setCyclones(formattedCyclones);
        } else {
          setCyclones([]);
          setError("No active tropical cyclones found");
        }
      } catch (err) {
        console.error("Error fetching typhoon data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch typhoon data");
      } finally {
        setLoading(false);
      }
    };

    fetchTyphoonData();
    // Refresh every 30 minutes
    const interval = setInterval(fetchTyphoonData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "tropical depression":
      case "td":
        return "#00FFFF";
      case "tropical storm":
      case "ts":
        return "#00FF00";
      case "category 1":
      case "cat1":
        return "#FFFF00";
      case "category 2":
      case "cat2":
        return "#FFA500";
      case "category 3":
      case "cat3":
        return "#FF6347";
      case "category 4":
      case "cat4":
        return "#FF0000";
      case "category 5":
      case "cat5":
        return "#8B0000";
      default:
        return "#808080";
    }
  };

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <MapContainer
        center={[15, 125]}
        zoom={5}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {cyclones.length > 0 && <FitBounds cyclones={cyclones} />}

        {cyclones.map((cyclone) => {
          const color = getCategoryColor(cyclone.category);

          return (
            <div key={cyclone.id}>
              {/* Historical Track */}
              {cyclone.track && cyclone.track.length > 0 && (
                <>
                  <Polyline
                    positions={cyclone.track.map((p) => [p.lat, p.lon] as [number, number])}
                    color={color}
                    weight={3}
                    opacity={0.7}
                    dashArray="5, 5"
                  />
                  {cyclone.track.map((point, idx) => (
                    <Circle
                      key={`track-${cyclone.id}-${idx}`}
                      center={[point.lat, point.lon] as [number, number]}
                      radius={5000}
                      pathOptions={{ color, fillColor: color, fillOpacity: 0.5 }}
                    />
                  ))}
                </>
              )}

              {/* Forecast Track */}
              {cyclone.forecast && cyclone.forecast.length > 0 && (
                <>
                  <Polyline
                    positions={[
                      [cyclone.position.lat, cyclone.position.lon] as [number, number],
                      ...cyclone.forecast.map((p) => [p.lat, p.lon] as [number, number]),
                    ]}
                    color={color}
                    weight={3}
                    opacity={0.5}
                    dashArray="10, 10"
                  />
                  {cyclone.forecast.map((point, idx) => (
                    <Circle
                      key={`forecast-${cyclone.id}-${idx}`}
                      center={[point.lat, point.lon] as [number, number]}
                      radius={5000}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.3,
                        dashArray: "5, 5",
                      }}
                    />
                  ))}
                </>
              )}

              {/* Current Position */}
              <Marker position={[cyclone.position.lat, cyclone.position.lon] as [number, number]}>
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-bold text-base mb-2">{cyclone.name}</h3>
                    <p><strong>Category:</strong> {cyclone.category}</p>
                    <p><strong>Basin:</strong> {cyclone.basin}</p>
                    <p><strong>Position:</strong> {cyclone.position.lat.toFixed(2)}°, {cyclone.position.lon.toFixed(2)}°</p>
                    <p><strong>Max Wind:</strong> {cyclone.wind.maxKPH} km/h ({cyclone.wind.maxKTS} kts)</p>
                    <p><strong>Pressure:</strong> {cyclone.pressure.mb} mb</p>
                    <p><strong>Movement:</strong> {cyclone.movement.speedKPH} km/h @ {cyclone.movement.dirDEG}°</p>
                  </div>
                </Popup>
              </Marker>

              {/* Danger radius */}
              <Circle
                center={[cyclone.position.lat, cyclone.position.lon] as [number, number]}
                radius={cyclone.wind.maxKPH * 1000}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
            </div>
          );
        })}
      </MapContainer>

      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="flex items-center gap-2 text-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading typhoon data...</span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] max-w-md">
          <div className="rounded-md bg-muted px-4 py-2 text-sm shadow-lg border space-y-1">
            <div>{error}</div>
            {typeof error === 'string' && error.toLowerCase().includes('namespace') && (
              <div className="text-xs text-muted-foreground">
                Add this domain to Xweather Namespace: {typeof window !== 'undefined' ? window.location.hostname : ''} (also include *.lovableproject.com and *.lovable.app)
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && cyclones.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border max-w-xs">
          <h4 className="font-semibold mb-2 text-sm">Active Tropical Cyclones: {cyclones.length}</h4>
          <div className="space-y-1 text-xs">
            {cyclones.map((cyclone) => (
              <div key={cyclone.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getCategoryColor(cyclone.category) }}
                />
                <span className="font-medium">{cyclone.name}</span>
                <span className="text-muted-foreground">({cyclone.category})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && cyclones.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
          <h4 className="font-semibold mb-2 text-xs">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-current opacity-70" style={{ borderTop: "2px dashed" }} />
              <span>Historical Track</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-current opacity-50" style={{ borderTop: "2px dashed" }} />
              <span>Forecast Track</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TyphoonMap;
