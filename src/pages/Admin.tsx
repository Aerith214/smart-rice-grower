import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface RainfallData {
  month: string;
  amount: number;
}

interface RecommendationData {
  planting: string[];
  harvesting: string[];
}

const Admin = () => {
  const { toast } = useToast();
  
  useSEO({
    title: "Admin Panel - SmartRice",
    description: "Manage rainfall data and planting recommendations for rice farming in Bayombong.",
    canonicalPath: "/admin",
  });

  const [rainfallData, setRainfallData] = useState<RainfallData[]>([
    { month: "January", amount: 0 },
    { month: "February", amount: 0 },
    { month: "March", amount: 0 },
    { month: "April", amount: 0 },
    { month: "May", amount: 0 },
    { month: "June", amount: 0 },
    { month: "July", amount: 0 },
    { month: "August", amount: 0 },
    { month: "September", amount: 0 },
    { month: "October", amount: 0 },
    { month: "November", amount: 0 },
    { month: "December", amount: 0 },
  ]);

  const [recommendations, setRecommendations] = useState<RecommendationData>({
    planting: [""],
    harvesting: [""],
  });

  const handleRainfallChange = (index: number, value: number) => {
    const updated = [...rainfallData];
    updated[index].amount = value;
    setRainfallData(updated);
  };

  const handleAddRecommendation = (type: 'planting' | 'harvesting') => {
    setRecommendations(prev => ({
      ...prev,
      [type]: [...prev[type], ""]
    }));
  };

  const handleRecommendationChange = (type: 'planting' | 'harvesting', index: number, value: string) => {
    setRecommendations(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }));
  };

  const handleRemoveRecommendation = (type: 'planting' | 'harvesting', index: number) => {
    setRecommendations(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSaveRainfall = () => {
    // TODO: Save to database when connected
    console.log("Saving rainfall data:", rainfallData);
    toast({
      title: "Rainfall Data Saved",
      description: "The rainfall data has been saved successfully.",
    });
  };

  const handleSaveRecommendations = () => {
    // TODO: Save to database when connected
    const filteredRecommendations = {
      planting: recommendations.planting.filter(date => date.trim() !== ""),
      harvesting: recommendations.harvesting.filter(date => date.trim() !== ""),
    };
    console.log("Saving recommendations:", filteredRecommendations);
    toast({
      title: "Recommendations Saved",
      description: "The planting recommendations have been saved successfully.",
    });
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage rainfall data and planting recommendations for the SmartRice system.
          </p>
        </header>

        <Tabs defaultValue="rainfall" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rainfall">Rainfall Data</TabsTrigger>
            <TabsTrigger value="recommendations">Planting Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="rainfall" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Rainfall Data (2025)</CardTitle>
                <CardDescription>
                  Enter the expected rainfall amounts for each month in millimeters (mm).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rainfallData.map((data, index) => (
                    <div key={data.month} className="space-y-2">
                      <Label htmlFor={`rainfall-${index}`}>{data.month}</Label>
                      <div className="relative">
                        <Input
                          id={`rainfall-${index}`}
                          type="number"
                          value={data.amount}
                          onChange={(e) => handleRainfallChange(index, parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          step="0.1"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                          mm
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button onClick={handleSaveRainfall} className="w-full md:w-auto">
                    Save Rainfall Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Planting Dates</CardTitle>
                  <CardDescription>
                    Add recommended planting dates for rice farming.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.planting.map((date, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => handleRecommendationChange('planting', index, e.target.value)}
                        className="flex-1"
                      />
                      {recommendations.planting.length > 1 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveRecommendation('planting', index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => handleAddRecommendation('planting')}
                    className="w-full"
                  >
                    Add Planting Date
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Harvesting Dates</CardTitle>
                  <CardDescription>
                    Add recommended harvesting dates for rice farming.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.harvesting.map((date, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => handleRecommendationChange('harvesting', index, e.target.value)}
                        className="flex-1"
                      />
                      {recommendations.harvesting.length > 1 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveRecommendation('harvesting', index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => handleAddRecommendation('harvesting')}
                    className="w-full"
                  >
                    Add Harvesting Date
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleSaveRecommendations} className="w-full md:w-auto">
                Save Recommendations
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Admin;