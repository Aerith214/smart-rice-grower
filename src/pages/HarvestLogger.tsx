import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Calendar, Sprout } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CropCycleGraph from "@/components/CropCycleGraph";

interface HarvestLog {
  id: string;
  crop_type: string;
  actual_harvest_date: string;
  actual_harvest_time: string;
  recommended_harvest_date: string;
  notes: string;
  created_at: string;
}

interface PlantingLog {
  id: string;
  crop_type: string;
  actual_planting_date: string;
  actual_planting_time: string;
  recommended_planting_date: string;
  notes: string;
  created_at: string;
}

const HarvestLogger = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [harvestLogs, setHarvestLogs] = useState<HarvestLog[]>([]);
  const [plantingLogs, setPlantingLogs] = useState<PlantingLog[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<"wet" | "dry">("wet");
  const [harvestFormData, setHarvestFormData] = useState({
    cropType: "",
    actualHarvestDate: "",
    actualHarvestTime: "",
    recommendedHarvestDate: "",
    notes: ""
  });
  const [plantingFormData, setPlantingFormData] = useState({
    cropType: "",
    actualPlantingDate: "",
    actualPlantingTime: "",
    recommendedPlantingDate: "",
    notes: ""
  });

  useSEO({
    title: "Harvest Logger - SmartRice",
    description: "Log your actual harvest dates and compare with recommendations.",
    canonicalPath: "/harvest-logger",
  });

  useEffect(() => {
    if (user) {
      fetchHarvestLogs();
      fetchPlantingLogs();
    }
  }, [user]);

  const fetchHarvestLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('harvest_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHarvestLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch harvest logs",
        variant: "destructive",
      });
    }
  };

  const fetchPlantingLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('planting_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlantingLogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch planting logs",
        variant: "destructive",
      });
    }
  };

  const handleHarvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('harvest_logs')
        .insert({
          user_id: user.id,
          crop_type: harvestFormData.cropType,
          actual_harvest_date: harvestFormData.actualHarvestDate,
          actual_harvest_time: harvestFormData.actualHarvestTime || null,
          recommended_harvest_date: harvestFormData.recommendedHarvestDate || null,
          notes: harvestFormData.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Harvest log recorded successfully",
      });

      setHarvestFormData({
        cropType: "",
        actualHarvestDate: "",
        actualHarvestTime: "",
        recommendedHarvestDate: "",
        notes: ""
      });

      fetchHarvestLogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record harvest log",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlantingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('planting_logs')
        .insert({
          user_id: user.id,
          crop_type: plantingFormData.cropType,
          actual_planting_date: plantingFormData.actualPlantingDate,
          actual_planting_time: plantingFormData.actualPlantingTime || null,
          recommended_planting_date: plantingFormData.recommendedPlantingDate || null,
          notes: plantingFormData.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Planting log recorded successfully",
      });

      setPlantingFormData({
        cropType: "",
        actualPlantingDate: "",
        actualPlantingTime: "",
        recommendedPlantingDate: "",
        notes: ""
      });

      fetchPlantingLogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record planting log",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteHarvestLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('harvest_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Harvest log deleted successfully",
      });

      fetchHarvestLogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete harvest log",
        variant: "destructive",
      });
    }
  };

  const deletePlantingLog = async (id: string) => {
    try {
      const { error } = await supabase
        .from('planting_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Planting log deleted successfully",
      });

      fetchPlantingLogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete planting log",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Harvest Logger</h1>
          <p className="text-muted-foreground">Please log in to record your harvest data.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground mb-2">Crop Cycle Logger</h1>
        <p className="text-muted-foreground">
          Track your planting and harvest activities, compare with recommendations.
        </p>
      </header>

      {/* Crop Cycle Comparison Graph */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Crop Cycle Timeline</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedSeason === "wet" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSeason("wet")}
              >
                Wet Season
              </Button>
              <Button
                variant={selectedSeason === "dry" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSeason("dry")}
              >
                Dry Season
              </Button>
            </div>
          </div>
          <CardDescription>
            Compare your actual planting and harvest dates with the standard {selectedSeason} season crop cycle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CropCycleGraph 
            plantingLogs={plantingLogs} 
            harvestLogs={harvestLogs}
            season={selectedSeason}
          />
        </CardContent>
      </Card>

      {/* Logging Forms and History */}
      <Tabs defaultValue="harvest" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="harvest">
            <Calendar className="h-4 w-4 mr-2" />
            Harvest Logger
          </TabsTrigger>
          <TabsTrigger value="planting">
            <Sprout className="h-4 w-4 mr-2" />
            Planting Logger
          </TabsTrigger>
        </TabsList>

        {/* Harvest Tab */}
        <TabsContent value="harvest">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Record New Harvest
                </CardTitle>
                <CardDescription>
                  Enter details about your recent harvest activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleHarvestSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="harvestCropType">Crop Type</Label>
                    <Input
                      id="harvestCropType"
                      value={harvestFormData.cropType}
                      onChange={(e) => setHarvestFormData({ ...harvestFormData, cropType: e.target.value })}
                      placeholder="e.g., Rice, Corn, Vegetables"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actualHarvestDate">Actual Harvest Date</Label>
                    <Input
                      id="actualHarvestDate"
                      type="date"
                      value={harvestFormData.actualHarvestDate}
                      onChange={(e) => setHarvestFormData({ ...harvestFormData, actualHarvestDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actualHarvestTime">Actual Harvest Time (Optional)</Label>
                    <Input
                      id="actualHarvestTime"
                      type="time"
                      value={harvestFormData.actualHarvestTime}
                      onChange={(e) => setHarvestFormData({ ...harvestFormData, actualHarvestTime: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recommendedHarvestDate">Recommended Harvest Date (Optional)</Label>
                    <Input
                      id="recommendedHarvestDate"
                      type="date"
                      value={harvestFormData.recommendedHarvestDate}
                      onChange={(e) => setHarvestFormData({ ...harvestFormData, recommendedHarvestDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="harvestNotes">Notes (Optional)</Label>
                    <Textarea
                      id="harvestNotes"
                      value={harvestFormData.notes}
                      onChange={(e) => setHarvestFormData({ ...harvestFormData, notes: e.target.value })}
                      placeholder="Any additional observations or comments..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Recording..." : "Record Harvest"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Harvest History</CardTitle>
                <CardDescription>
                  Recent harvest logs and their details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {harvestLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No harvest logs recorded yet.
                    </p>
                  ) : (
                    harvestLogs.map((log) => {
                      const actualDate = new Date(log.actual_harvest_date);
                      const recommendedDate = log.recommended_harvest_date 
                        ? new Date(log.recommended_harvest_date)
                        : null;
                      
                      let comparisonText = "";
                      let comparisonColor = "";
                      
                      if (recommendedDate) {
                        const daysDifference = Math.floor(
                          (actualDate.getTime() - recommendedDate.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        
                        if (daysDifference === 0) {
                          comparisonText = "Perfect timing! ✓";
                          comparisonColor = "text-green-600";
                        } else if (daysDifference > 0) {
                          comparisonText = `${daysDifference} days late`;
                          comparisonColor = "text-orange-600";
                        } else {
                          comparisonText = `${Math.abs(daysDifference)} days early`;
                          comparisonColor = "text-blue-600";
                        }
                      }
                      
                      return (
                        <div key={log.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{log.crop_type}</h4>
                              <p className="text-sm text-muted-foreground">
                                Harvested: {actualDate.toLocaleDateString()}
                                {log.actual_harvest_time && ` at ${log.actual_harvest_time}`}
                              </p>
                              {recommendedDate && (
                                <>
                                  <p className="text-sm text-muted-foreground">
                                    Recommended: {recommendedDate.toLocaleDateString()}
                                  </p>
                                  <p className={`text-sm font-medium mt-1 ${comparisonColor}`}>
                                    {comparisonText}
                                  </p>
                                </>
                              )}
                              {log.notes && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                  "{log.notes}"
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteHarvestLog(log.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Planting Tab */}
        <TabsContent value="planting">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5" />
                  Record New Planting
                </CardTitle>
                <CardDescription>
                  Enter details about your recent planting activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlantingSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="plantingCropType">Crop Type</Label>
                    <Input
                      id="plantingCropType"
                      value={plantingFormData.cropType}
                      onChange={(e) => setPlantingFormData({ ...plantingFormData, cropType: e.target.value })}
                      placeholder="e.g., Rice, Corn, Vegetables"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actualPlantingDate">Actual Planting Date</Label>
                    <Input
                      id="actualPlantingDate"
                      type="date"
                      value={plantingFormData.actualPlantingDate}
                      onChange={(e) => setPlantingFormData({ ...plantingFormData, actualPlantingDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actualPlantingTime">Actual Planting Time (Optional)</Label>
                    <Input
                      id="actualPlantingTime"
                      type="time"
                      value={plantingFormData.actualPlantingTime}
                      onChange={(e) => setPlantingFormData({ ...plantingFormData, actualPlantingTime: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recommendedPlantingDate">Recommended Planting Date (Optional)</Label>
                    <Input
                      id="recommendedPlantingDate"
                      type="date"
                      value={plantingFormData.recommendedPlantingDate}
                      onChange={(e) => setPlantingFormData({ ...plantingFormData, recommendedPlantingDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plantingNotes">Notes (Optional)</Label>
                    <Textarea
                      id="plantingNotes"
                      value={plantingFormData.notes}
                      onChange={(e) => setPlantingFormData({ ...plantingFormData, notes: e.target.value })}
                      placeholder="Any additional observations or comments..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Recording..." : "Record Planting"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Planting History</CardTitle>
                <CardDescription>
                  Recent planting logs and their details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {plantingLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No planting logs recorded yet.
                    </p>
                  ) : (
                    plantingLogs.map((log) => {
                      const actualDate = new Date(log.actual_planting_date);
                      const recommendedDate = log.recommended_planting_date 
                        ? new Date(log.recommended_planting_date)
                        : null;
                      
                      let comparisonText = "";
                      let comparisonColor = "";
                      
                      if (recommendedDate) {
                        const daysDifference = Math.floor(
                          (actualDate.getTime() - recommendedDate.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        
                        if (daysDifference === 0) {
                          comparisonText = "Perfect timing! ✓";
                          comparisonColor = "text-green-600";
                        } else if (daysDifference > 0) {
                          comparisonText = `${daysDifference} days late`;
                          comparisonColor = "text-orange-600";
                        } else {
                          comparisonText = `${Math.abs(daysDifference)} days early`;
                          comparisonColor = "text-blue-600";
                        }
                      }
                      
                      return (
                        <div key={log.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{log.crop_type}</h4>
                              <p className="text-sm text-muted-foreground">
                                Planted: {actualDate.toLocaleDateString()}
                                {log.actual_planting_time && ` at ${log.actual_planting_time}`}
                              </p>
                              {recommendedDate && (
                                <>
                                  <p className="text-sm text-muted-foreground">
                                    Recommended: {recommendedDate.toLocaleDateString()}
                                  </p>
                                  <p className={`text-sm font-medium mt-1 ${comparisonColor}`}>
                                    {comparisonText}
                                  </p>
                                </>
                              )}
                              {log.notes && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                  "{log.notes}"
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePlantingLog(log.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default HarvestLogger;