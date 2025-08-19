import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Sprout, Scissors } from "lucide-react";

interface Recommendations {
  planting: string[]; // ISO dates
  harvesting: string[]; // ISO dates
}

interface DatabaseRecommendation {
  id: string;
  planting_date: string;
  harvesting_date: string;
  created_at: string;
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
  const [dbRecommendations, setDbRecommendations] = useState<DatabaseRecommendation[]>([]);

  useEffect(() => {
    (async () => {
      // Load JSON recommendations
      const res = await fetch("/data/recommendations.json");
      const json = (await res.json()) as Recommendations;
      setRecs(json);

      // Load database recommendations
      const { data, error } = await supabase
        .from('planting_recommendations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading recommendations:', error);
      } else {
        setDbRecommendations(data || []);
      }
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

      {/* Database Recommendations Section */}
      <section className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              All Planting & Harvesting Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dbRecommendations.length > 0 ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Planting Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-planting">
                      <Sprout className="h-4 w-4" />
                      Planting Dates
                    </h3>
                    <div className="space-y-2">
                      {dbRecommendations
                        .filter(rec => rec.planting_date)
                        .sort((a, b) => new Date(a.planting_date).getTime() - new Date(b.planting_date).getTime())
                        .map((rec) => (
                          <div key={`plant-${rec.id}`} className="flex items-center justify-between p-3 bg-planting/10 rounded-lg border border-planting/20">
                            <span className="font-medium">
                              {new Date(rec.planting_date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <Badge variant="secondary" className="bg-planting text-planting-foreground">
                              <Sprout className="h-3 w-3 mr-1" />
                              Plant
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Harvesting Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-harvesting">
                      <Scissors className="h-4 w-4" />
                      Harvesting Dates
                    </h3>
                    <div className="space-y-2">
                      {dbRecommendations
                        .filter(rec => rec.harvesting_date)
                        .sort((a, b) => new Date(a.harvesting_date).getTime() - new Date(b.harvesting_date).getTime())
                        .map((rec) => (
                          <div key={`harvest-${rec.id}`} className="flex items-center justify-between p-3 bg-harvesting/10 rounded-lg border border-harvesting/20">
                            <span className="font-medium">
                              {new Date(rec.harvesting_date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <Badge variant="secondary" className="bg-harvesting text-harvesting-foreground">
                              <Scissors className="h-3 w-3 mr-1" />
                              Harvest
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recommendations found in the database.</p>
                <p className="text-sm">Ask your administrator to add planting and harvesting recommendations.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default RecommendationPage;
