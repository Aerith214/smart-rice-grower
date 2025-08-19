import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";

interface Recommendations {
  planting: string[]; // ISO dates
  harvesting: string[]; // ISO dates
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysMatrix(year: number, month: number) {
  // month 0-11
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const matrix: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) matrix.push(null);
  for (let d = 1; d <= daysInMonth; d++) matrix.push(d);
  while (matrix.length % 7 !== 0) matrix.push(null);
  return matrix;
}

const RecommendationPage = () => {
  useSEO({
    title: "SmartRice – Planting & Harvesting Calendar",
    description:
      "Monthly calendar showing recommended planting and harvesting dates for Bayombong.",
    canonicalPath: "/recommendation",
  });

  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [recs, setRecs] = useState<Recommendations | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/data/recommendations.json");
      const json = (await res.json()) as Recommendations;
      setRecs(json);
    })();
  }, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  const matrix = useMemo(() => getDaysMatrix(year, month), [year, month]);

  const plantingSet = useMemo(() => new Set((recs?.planting ?? []).filter(d => new Date(d).getFullYear() === year && new Date(d).getMonth() === month)), [recs, year, month]);
  const harvestingSet = useMemo(() => new Set((recs?.harvesting ?? []).filter(d => new Date(d).getFullYear() === year && new Date(d).getMonth() === month)), [recs, year, month]);

  return (
    <main className="container mx-auto py-10">
      <section>
        <Card>
          <CardHeader className="flex items-start justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle>Recommendation Calendar</CardTitle>
            <div className="flex gap-2">
              <button
                className="rounded-md border bg-background px-3 py-2"
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                aria-label="Previous month"
              >
                ← Prev
              </button>
              <button
                className="rounded-md border bg-background px-3 py-2"
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                aria-label="Next month"
              >
                Next →
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">{monthLabel}</p>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-sm text-muted-foreground">
                  {d}
                </div>
              ))}
              {matrix.map((d, i) => {
                const dateStr = d ? new Date(year, month, d).toISOString().slice(0, 10) : "";
                const isPlant = d && recs && plantingSet.has(dateStr);
                const isHarvest = d && recs && harvestingSet.has(dateStr);
                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-20 rounded-md border bg-card p-2 text-center transition-colors",
                      !d && "opacity-50",
                      isPlant && isHarvest && "bg-gradient-to-br from-planting/20 to-harvesting/20 border-planting",
                      isPlant && !isHarvest && "bg-planting/20 border-planting",
                      !isPlant && isHarvest && "bg-harvesting/20 border-harvesting"
                    )}
                  >
                    {d && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-sm font-medium">{d}</div>
                        <div className="flex gap-1 text-xs">
                          {isPlant && (
                            <span 
                              title="Planting" 
                              className="px-1 py-0.5 rounded text-planting-foreground bg-planting text-[10px] font-medium"
                            >
                              🌱
                            </span>
                          )}
                          {isHarvest && (
                            <span 
                              title="Harvesting" 
                              className="px-1 py-0.5 rounded text-harvesting-foreground bg-harvesting text-[10px] font-medium"
                            >
                              🌾
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Legend:</span>
              <span className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-planting text-planting-foreground text-xs font-medium">🌱 Planting</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-harvesting text-harvesting-foreground text-xs font-medium">🌾 Harvesting</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default RecommendationPage;
