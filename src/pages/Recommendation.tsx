import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSEO } from "@/hooks/useSEO";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Sprout, Scissors, ChevronLeft, ChevronRight } from "lucide-react";

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

// Date helpers that avoid timezone shifts
const toYMD = (y: number, m0: number, d: number) =>
  `${y}-${String(m0 + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const takeYMD = (s?: string) => (s ?? "").slice(0, 10);

const parseYMD = (s?: string) => {
  const [y, m, d] = takeYMD(s).split("-").map(Number);
  return { y, m, d };
};

const utcTimeOfYMD = (s?: string) => {
  const { y, m, d } = parseYMD(s);
  if (!y || !m || !d) return NaN;
  return Date.UTC(y, m - 1, d);
};

const isSameMonthYear = (s: string, year: number, month0: number) => {
  const { y, m } = parseYMD(s);
  return y === year && m - 1 === month0;
};

const formatYMDHuman = (s?: string) => {
  const { y, m, d } = parseYMD(s);
  if (!y || !m || !d) return s ?? "";
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
};

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
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [recs, setRecs] = useState<Recommendations | null>(null);
  const [dbRecommendations, setDbRecommendations] = useState<DatabaseRecommendation[]>([]);

  // Generate year options (current year ± 5 years)
  const yearOptions = useMemo(() => {
    const currentYear = today.getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  }, [today]);

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

  const year = selectedYear;
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString(undefined, { month: "long" });

  const matrix = useMemo(() => getDaysMatrix(year, month), [year, month]);

  // Only use database recommendations
  const plantingSet = useMemo(() => {
    const dbPlanting = dbRecommendations
      .filter((rec) => rec.planting_date)
      .map((rec) => takeYMD(rec.planting_date))
      .filter((d) => isSameMonthYear(d, year, month));
    return new Set(dbPlanting);
  }, [dbRecommendations, year, month]);

  const harvestingSet = useMemo(() => {
    const dbHarvesting = dbRecommendations
      .filter((rec) => rec.harvesting_date)
      .map((rec) => takeYMD(rec.harvesting_date))
      .filter((d) => isSameMonthYear(d, year, month));
    return new Set(dbHarvesting);
  }, [dbRecommendations, year, month]);

  // Handle year change
  const handleYearChange = (newYear: string) => {
    const yearNum = parseInt(newYear);
    setSelectedYear(yearNum);
    setCursor(new Date(yearNum, month, 1));
  };

  // Handle month navigation
  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCursor(newDate);
    if (newDate.getFullYear() !== year) {
      setSelectedYear(newDate.getFullYear());
    }
  };

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCursor(newDate);
    if (newDate.getFullYear() !== year) {
      setSelectedYear(newDate.getFullYear());
    }
  };

  return (
    <main className="container mx-auto py-10">
      <section>
        <Card>
          <CardHeader className="flex items-start justify-between gap-4 sm:flex-row sm:items-center">
            <CardTitle>Recommendation Calendar</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Year:</span>
                <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((yearOption) => (
                      <SelectItem key={yearOption} value={yearOption.toString()}>
                        {yearOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousMonth}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextMonth}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground font-medium">{monthLabel} {year}</p>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((d) => (
                <div key={d} className="text-center text-sm text-muted-foreground">
                  {d}
                </div>
              ))}
              {matrix.map((d, i) => {
                const dateStr = d ? toYMD(year, month, d) : "";
                const isPlant = d && plantingSet.has(dateStr);
                const isHarvest = d && harvestingSet.has(dateStr);
                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-20 rounded-lg border-2 bg-card p-2 text-center transition-all hover:shadow-md",
                      !d && "opacity-30 border-border/50",
                      isPlant && isHarvest && "bg-gradient-to-br from-planting/30 to-harvesting/30 border-planting shadow-lg",
                      isPlant && !isHarvest && "bg-planting/25 border-planting shadow-md",
                      !isPlant && isHarvest && "bg-harvesting/25 border-harvesting shadow-md",
                      !isPlant && !isHarvest && d && "border-border hover:border-primary/50"
                    )}
                  >
                    {d && (
                      <div className="flex flex-col items-center gap-2">
                        <div className={cn(
                          "text-sm font-semibold",
                          (isPlant || isHarvest) && "text-foreground"
                        )}>{d}</div>
                        <div className="flex flex-col gap-1">
                          {isPlant && (
                            <div className="flex items-center justify-center">
                              <span 
                                title="Planting Day" 
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-planting-foreground bg-planting text-[10px] font-bold shadow-sm"
                              >
                                <Sprout className="h-2.5 w-2.5" />
                                Plant
                              </span>
                            </div>
                          )}
                          {isHarvest && (
                            <div className="flex items-center justify-center">
                              <span 
                                title="Harvesting Day" 
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-harvesting-foreground bg-harvesting text-[10px] font-bold shadow-sm"
                              >
                                <Scissors className="h-2.5 w-2.5" />
                                Harvest
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <span className="text-muted-foreground font-medium">Legend:</span>
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 text-planting" />
                <span className="px-3 py-1.5 rounded-full bg-planting text-planting-foreground text-xs font-bold shadow-sm">Planting Days</span>
              </div>
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-harvesting" />
                <span className="px-3 py-1.5 rounded-full bg-harvesting text-harvesting-foreground text-xs font-bold shadow-sm">Harvesting Days</span>
              </div>
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
                        .sort((a, b) => utcTimeOfYMD(a.planting_date) - utcTimeOfYMD(b.planting_date))
                        .map((rec) => (
                          <div key={`plant-${rec.id}`} className="flex items-center justify-between p-3 bg-planting/10 rounded-lg border border-planting/20">
                            <span className="font-medium">
                              {formatYMDHuman(rec.planting_date)}
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
                        .sort((a, b) => utcTimeOfYMD(a.harvesting_date) - utcTimeOfYMD(b.harvesting_date))
                        .map((rec) => (
                          <div key={`harvest-${rec.id}`} className="flex items-center justify-between p-3 bg-harvesting/10 rounded-lg border border-harvesting/20">
                            <span className="font-medium">
                              {formatYMDHuman(rec.harvesting_date)}
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
