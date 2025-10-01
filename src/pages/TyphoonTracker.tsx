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
import { Cloud, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Typhoon {
  id: string;
  name: string;
  category: string;
  date_entered: string;
  date_exited: string;
  max_wind_speed: number;
  rainfall_amount: number;
  affected_areas: string;
  damage_description: string;
  created_at: string;
}

const TyphoonTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [typhoons, setTyphoons] = useState<Typhoon[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTyphoon, setEditingTyphoon] = useState<Typhoon | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    dateEntered: "",
    dateExited: "",
    maxWindSpeed: "",
    rainfallAmount: "",
    affectedAreas: "",
    damageDescription: ""
  });

  useSEO({
    title: "Typhoon Tracker - SmartRice",
    description: "Track and record typhoon events affecting Bayombong rice farming.",
    canonicalPath: "/typhoon-tracker",
  });

  useEffect(() => {
    fetchTyphoons();
  }, []);

  const fetchTyphoons = async () => {
    try {
      const { data, error } = await supabase
        .from('typhoons')
        .select('*')
        .order('date_entered', { ascending: false });

      if (error) throw error;
      setTyphoons(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch typhoon records",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      dateEntered: "",
      dateExited: "",
      maxWindSpeed: "",
      rainfallAmount: "",
      affectedAreas: "",
      damageDescription: ""
    });
    setEditingTyphoon(null);
  };

  const handleEdit = (typhoon: Typhoon) => {
    setEditingTyphoon(typhoon);
    setFormData({
      name: typhoon.name,
      category: typhoon.category || "",
      dateEntered: typhoon.date_entered,
      dateExited: typhoon.date_exited || "",
      maxWindSpeed: typhoon.max_wind_speed?.toString() || "",
      rainfallAmount: typhoon.rainfall_amount?.toString() || "",
      affectedAreas: typhoon.affected_areas || "",
      damageDescription: typhoon.damage_description || ""
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to record typhoon data",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const typhoonData = {
        name: formData.name,
        category: formData.category || null,
        date_entered: formData.dateEntered,
        date_exited: formData.dateExited || null,
        max_wind_speed: formData.maxWindSpeed ? parseFloat(formData.maxWindSpeed) : null,
        rainfall_amount: formData.rainfallAmount ? parseFloat(formData.rainfallAmount) : null,
        affected_areas: formData.affectedAreas || null,
        damage_description: formData.damageDescription || null,
      };

      let error;
      if (editingTyphoon) {
        ({ error } = await supabase
          .from('typhoons')
          .update(typhoonData)
          .eq('id', editingTyphoon.id));
      } else {
        ({ error } = await supabase
          .from('typhoons')
          .insert(typhoonData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Typhoon record ${editingTyphoon ? 'updated' : 'created'} successfully`,
      });

      resetForm();
      setIsDialogOpen(false);
      fetchTyphoons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save typhoon record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTyphoon = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('typhoons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Typhoon record deleted successfully",
      });

      fetchTyphoons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete typhoon record",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Cloud className="h-8 w-8" />
          Typhoon Tracker
        </h1>
        <p className="text-muted-foreground">
          Record and monitor typhoon events affecting agricultural activities in Bayombong.
        </p>
      </header>

      <div className="mb-6">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Cloud className="mr-2 h-4 w-4" />
              Record New Typhoon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTyphoon ? 'Edit' : 'Record'} Typhoon Event</DialogTitle>
              <DialogDescription>
                Enter details about the typhoon event and its impact on the area.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Typhoon Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Typhoon Yolanda"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Category 5, Super Typhoon"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateEntered">Date Entered *</Label>
                  <Input
                    id="dateEntered"
                    type="date"
                    value={formData.dateEntered}
                    onChange={(e) => setFormData({ ...formData, dateEntered: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateExited">Date Exited</Label>
                  <Input
                    id="dateExited"
                    type="date"
                    value={formData.dateExited}
                    onChange={(e) => setFormData({ ...formData, dateExited: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxWindSpeed">Max Wind Speed (km/h)</Label>
                  <Input
                    id="maxWindSpeed"
                    type="number"
                    step="0.1"
                    value={formData.maxWindSpeed}
                    onChange={(e) => setFormData({ ...formData, maxWindSpeed: e.target.value })}
                    placeholder="e.g., 250"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rainfallAmount">Rainfall Amount (mm)</Label>
                  <Input
                    id="rainfallAmount"
                    type="number"
                    step="0.1"
                    value={formData.rainfallAmount}
                    onChange={(e) => setFormData({ ...formData, rainfallAmount: e.target.value })}
                    placeholder="e.g., 500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="affectedAreas">Affected Areas</Label>
                <Input
                  id="affectedAreas"
                  value={formData.affectedAreas}
                  onChange={(e) => setFormData({ ...formData, affectedAreas: e.target.value })}
                  placeholder="e.g., Bayombong, Solano, Bambang"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="damageDescription">Damage Description</Label>
                <Textarea
                  id="damageDescription"
                  value={formData.damageDescription}
                  onChange={(e) => setFormData({ ...formData, damageDescription: e.target.value })}
                  placeholder="Describe the impact on crops, infrastructure, and farming activities..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Saving..." : editingTyphoon ? "Update Record" : "Record Typhoon"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {typhoons.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12">
              <p className="text-muted-foreground text-center">
                No typhoon records found. Record your first typhoon event to start tracking.
              </p>
            </CardContent>
          </Card>
        ) : (
          typhoons.map((typhoon) => (
            <Card key={typhoon.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="h-5 w-5" />
                      {typhoon.name}
                    </CardTitle>
                    {typhoon.category && (
                      <CardDescription>{typhoon.category}</CardDescription>
                    )}
                  </div>
                  {user && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(typhoon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTyphoon(typhoon.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Entered:</span>{" "}
                  {new Date(typhoon.date_entered).toLocaleDateString()}
                </div>
                {typhoon.date_exited && (
                  <div className="text-sm">
                    <span className="font-medium">Exited:</span>{" "}
                    {new Date(typhoon.date_exited).toLocaleDateString()}
                  </div>
                )}
                {typhoon.max_wind_speed && (
                  <div className="text-sm">
                    <span className="font-medium">Max Wind:</span>{" "}
                    {typhoon.max_wind_speed} km/h
                  </div>
                )}
                {typhoon.rainfall_amount && (
                  <div className="text-sm">
                    <span className="font-medium">Rainfall:</span>{" "}
                    {typhoon.rainfall_amount} mm
                  </div>
                )}
                {typhoon.affected_areas && (
                  <div className="text-sm">
                    <span className="font-medium">Affected Areas:</span>{" "}
                    {typhoon.affected_areas}
                  </div>
                )}
                {typhoon.damage_description && (
                  <div className="text-sm mt-2">
                    <span className="font-medium">Impact:</span>
                    <p className="text-muted-foreground mt-1">
                      {typhoon.damage_description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
};

export default TyphoonTracker;
