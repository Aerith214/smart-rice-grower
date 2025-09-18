import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Calendar, Droplets, AlertTriangle } from "lucide-react";

interface HarvestLog {
  id: string;
  crop_type: string;
  actual_harvest_date: string;
  actual_harvest_time: string;
  recommended_harvest_date: string;
  notes: string;
  created_at: string;
}

interface RainfallData {
  date: string;
  rainfall_amount: number;
}

interface ComparisonData extends HarvestLog {
  daysDifference: number;
  rainfallDuringPeriod: number;
  rainfallRelevance: 'High' | 'Medium' | 'Low';
  weatherImpact: string;
}

const HarvestComparison = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);

  useSEO({
    title: "Harvest Comparison - SmartRice",
    description: "Compare recommended vs actual harvest dates with rainfall analysis.",
    canonicalPath: "/harvest-comparison",
  });

  useEffect(() => {
    if (user) {
      fetchComparisonData();
    }
  }, [user]);

  const fetchComparisonData = async () => {
    setLoading(true);
    try {
      // Fetch harvest logs
      const { data: harvestLogs, error: harvestError } = await supabase
        .from('harvest_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (harvestError) throw harvestError;

      // Fetch rainfall data
      const { data: rainfallData, error: rainfallError } = await supabase
        .from('daily_rainfall')
        .select('date, rainfall_amount')
        .order('date', { ascending: false });

      if (rainfallError) throw rainfallError;

      // Create rainfall lookup map
      const rainfallMap = new Map(
        rainfallData?.map(r => [r.date, r.rainfall_amount || 0]) || []
      );

      // Process comparison data
      const processedData: ComparisonData[] = (harvestLogs || []).map(log => {
        let daysDifference = 0;
        let rainfallDuringPeriod = 0;

        if (log.recommended_harvest_date) {
          const actualDate = new Date(log.actual_harvest_date);
          const recommendedDate = new Date(log.recommended_harvest_date);
          daysDifference = Math.round((actualDate.getTime() - recommendedDate.getTime()) / (1000 * 60 * 60 * 24));

          // Calculate rainfall during the period between recommended and actual harvest
          const startDate = daysDifference < 0 ? actualDate : recommendedDate;
          const endDate = daysDifference < 0 ? recommendedDate : actualDate;
          
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const rainfall = rainfallMap.get(dateStr) || 0;
            rainfallDuringPeriod += rainfall;
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }

        // Determine rainfall relevance
        let rainfallRelevance: 'High' | 'Medium' | 'Low' = 'Low';
        if (rainfallDuringPeriod > 100) rainfallRelevance = 'High';
        else if (rainfallDuringPeriod > 30) rainfallRelevance = 'Medium';

        // Determine weather impact
        let weatherImpact = 'Minimal impact';
        if (Math.abs(daysDifference) > 7 && rainfallDuringPeriod > 50) {
          weatherImpact = 'High rainfall likely influenced timing';
        } else if (Math.abs(daysDifference) > 3 && rainfallDuringPeriod > 20) {
          weatherImpact = 'Moderate weather influence possible';
        }

        return {
          ...log,
          daysDifference,
          rainfallDuringPeriod,
          rainfallRelevance,
          weatherImpact
        };
      });

      setComparisons(processedData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch comparison data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifferenceColor = (days: number) => {
    if (days === 0) return "text-green-600";
    if (Math.abs(days) <= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getDifferenceIcon = (days: number) => {
    if (days > 0) return <TrendingUp className="h-4 w-4" />;
    if (days < 0) return <TrendingDown className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const getRainfallBadgeVariant = (relevance: string) => {
    switch (relevance) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      default: return 'secondary';
    }
  };

  if (!user) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Harvest Comparison</h1>
          <p className="text-muted-foreground">Please log in to view your harvest comparison data.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Harvest Comparison</h1>
        <p className="text-muted-foreground">
          Compare your actual harvest dates with system recommendations and analyze weather impacts.
        </p>
      </header>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading comparison data...</p>
        </div>
      ) : comparisons.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No harvest logs with recommendations found. Record some harvests with recommended dates to see comparisons.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Harvests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{comparisons.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Timing Difference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {comparisons.filter(c => c.recommended_harvest_date).length > 0
                    ? Math.round(
                        comparisons
                          .filter(c => c.recommended_harvest_date)
                          .reduce((sum, c) => sum + Math.abs(c.daysDifference), 0) /
                        comparisons.filter(c => c.recommended_harvest_date).length
                      )
                    : 0} days
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High Weather Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {comparisons.filter(c => c.rainfallRelevance === 'High').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Comparisons */}
          <div className="space-y-4">
            {comparisons.map((comparison) => (
              <Card key={comparison.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{comparison.crop_type}</CardTitle>
                      <CardDescription>
                        Recorded on {new Date(comparison.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={getRainfallBadgeVariant(comparison.rainfallRelevance)}>
                      <Droplets className="h-3 w-3 mr-1" />
                      {comparison.rainfallRelevance} Rainfall Impact
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Actual Harvest Date */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Actual Harvest</h4>
                      <p className="text-sm">{new Date(comparison.actual_harvest_date).toLocaleDateString()}</p>
                      {comparison.actual_harvest_time && (
                        <p className="text-xs text-muted-foreground">at {comparison.actual_harvest_time}</p>
                      )}
                    </div>

                    {/* Recommended Harvest Date */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Recommended</h4>
                      {comparison.recommended_harvest_date ? (
                        <p className="text-sm">{new Date(comparison.recommended_harvest_date).toLocaleDateString()}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No recommendation</p>
                      )}
                    </div>

                    {/* Timing Difference */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Timing Difference</h4>
                      {comparison.recommended_harvest_date ? (
                        <div className={`flex items-center gap-1 text-sm ${getDifferenceColor(comparison.daysDifference)}`}>
                          {getDifferenceIcon(comparison.daysDifference)}
                          {comparison.daysDifference === 0 ? (
                            'On time'
                          ) : comparison.daysDifference > 0 ? (
                            `${comparison.daysDifference} days late`
                          ) : (
                            `${Math.abs(comparison.daysDifference)} days early`
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">-</p>
                      )}
                    </div>

                    {/* Rainfall During Period */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Rainfall During Period</h4>
                      <p className="text-sm">{comparison.rainfallDuringPeriod.toFixed(1)} mm</p>
                    </div>
                  </div>

                  {/* Weather Impact Analysis */}
                  {comparison.weatherImpact !== 'Minimal impact' && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Weather Impact Analysis</span>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        {comparison.weatherImpact}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {comparison.notes && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">Notes</h4>
                      <p className="text-sm text-muted-foreground">{comparison.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default HarvestComparison;