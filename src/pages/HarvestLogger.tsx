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
import { Trash2, Calendar } from "lucide-react";

interface HarvestLog {
  id: string;
  crop_type: string;
  actual_harvest_date: string;
  actual_harvest_time: string;
  recommended_harvest_date: string;
  notes: string;
  created_at: string;
}

const HarvestLogger = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [harvestLogs, setHarvestLogs] = useState<HarvestLog[]>([]);
  const [formData, setFormData] = useState({
    cropType: "",
    actualHarvestDate: "",
    actualHarvestTime: "",
    recommendedHarvestDate: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('harvest_logs')
        .insert({
          user_id: user.id,
          crop_type: formData.cropType,
          actual_harvest_date: formData.actualHarvestDate,
          actual_harvest_time: formData.actualHarvestTime || null,
          recommended_harvest_date: formData.recommendedHarvestDate || null,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Harvest log recorded successfully",
      });

      setFormData({
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
    <main className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Harvest Logger</h1>
        <p className="text-muted-foreground">
          Record your actual harvest dates and compare with system recommendations.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Harvest Log Form */}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type</Label>
                <Input
                  id="cropType"
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  placeholder="e.g., Rice, Corn, Vegetables"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualHarvestDate">Actual Harvest Date</Label>
                <Input
                  id="actualHarvestDate"
                  type="date"
                  value={formData.actualHarvestDate}
                  onChange={(e) => setFormData({ ...formData, actualHarvestDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualHarvestTime">Actual Harvest Time (Optional)</Label>
                <Input
                  id="actualHarvestTime"
                  type="time"
                  value={formData.actualHarvestTime}
                  onChange={(e) => setFormData({ ...formData, actualHarvestTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendedHarvestDate">Recommended Harvest Date (Optional)</Label>
                <Input
                  id="recommendedHarvestDate"
                  type="date"
                  value={formData.recommendedHarvestDate}
                  onChange={(e) => setFormData({ ...formData, recommendedHarvestDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

        {/* Harvest Logs History */}
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
                harvestLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">{log.crop_type}</h4>
                        <p className="text-sm text-muted-foreground">
                          Harvested: {new Date(log.actual_harvest_date).toLocaleDateString()}
                          {log.actual_harvest_time && ` at ${log.actual_harvest_time}`}
                        </p>
                        {log.recommended_harvest_date && (
                          <p className="text-sm text-muted-foreground">
                            Recommended: {new Date(log.recommended_harvest_date).toLocaleDateString()}
                          </p>
                        )}
                        {log.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default HarvestLogger;