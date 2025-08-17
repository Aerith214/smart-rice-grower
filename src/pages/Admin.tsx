import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DailyRainfallData {
  date: string;
  amount: number;
}

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
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Helper function to convert month names to numbers
  const getMonthNumber = (monthName: string): number => {
    const months = {
      "January": 1, "February": 2, "March": 3, "April": 4,
      "May": 5, "June": 6, "July": 7, "August": 8,
      "September": 9, "October": 10, "November": 11, "December": 12
    };
    return months[monthName as keyof typeof months] || 1;
  };
  
  useSEO({
    title: "Admin Panel - SmartRice",
    description: "Manage rainfall data and planting recommendations for rice farming in Bayombong.",
    canonicalPath: "/admin",
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="text-center">Loading...</div>
      </main>
    );
  }

  const [dailyRainfallData, setDailyRainfallData] = useState<DailyRainfallData[]>([
    { date: "", amount: 0 }
  ]);
  
  const [existingDailyData, setExistingDailyData] = useState<DailyRainfallData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Generate year options from 2015 to present
  const years = Array.from({ length: new Date().getFullYear() - 2014 }, (_, i) => 2015 + i);

  const [recommendations, setRecommendations] = useState<RecommendationData>({
    planting: [""],
    harvesting: [""],
  });

  // Fetch existing daily rainfall data
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const { data, error } = await supabase
          .from('daily_rainfall')
          .select('*')
          .gte('date', `${selectedYear}-01-01`)
          .lt('date', `${selectedYear + 1}-01-01`)
          .order('date');
        
        if (error) throw error;
        
        const formattedData = data?.map(item => ({
          date: item.date,
          amount: item.rainfall_amount || 0
        })) || [];
        
        setExistingDailyData(formattedData);
      } catch (error: any) {
        console.error('Error fetching existing data:', error);
      }
    };
    
    if (user) {
      fetchExistingData();
    }
  }, [user, selectedYear]);

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  const handleEditExistingData = (index: number, field: 'date' | 'amount', value: string | number) => {
    const updated = [...existingDailyData];
    updated[index] = { ...updated[index], [field]: value };
    setExistingDailyData(updated);
  };

  const handleDeleteExistingData = async (index: number) => {
    const dataToDelete = existingDailyData[index];
    try {
      const { error } = await supabase
        .from('daily_rainfall')
        .delete()
        .eq('date', dataToDelete.date);

      if (error) throw error;

      setExistingDailyData(existingDailyData.filter((_, i) => i !== index));
      toast({
        title: "Data Deleted",
        description: "The rainfall data has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting data:', error);
      toast({
        title: "Delete Error",
        description: error.message || "Failed to delete data",
        variant: "destructive",
      });
    }
  };

  const handleSaveExistingData = async (index: number) => {
    const dataToSave = existingDailyData[index];
    try {
      const { error } = await supabase
        .from('daily_rainfall')
        .update({ rainfall_amount: dataToSave.amount })
        .eq('date', dataToSave.date);

      if (error) throw error;

      toast({
        title: "Data Updated",
        description: "The rainfall data has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating data:', error);
      toast({
        title: "Update Error",
        description: error.message || "Failed to update data",
        variant: "destructive",
      });
    }
  };

  const handleDailyRainfallChange = (index: number, field: 'date' | 'amount', value: string | number) => {
    const updated = [...dailyRainfallData];
    updated[index] = { ...updated[index], [field]: value };
    setDailyRainfallData(updated);
  };

  const handleAddDailyRainfall = () => {
    setDailyRainfallData([...dailyRainfallData, { date: "", amount: 0 }]);
  };

  const handleRemoveDailyRainfall = (index: number) => {
    if (dailyRainfallData.length > 1) {
      setDailyRainfallData(dailyRainfallData.filter((_, i) => i !== index));
    }
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


  const handleSaveRecommendations = async () => {
    try {
      const filteredRecommendations = {
        planting: recommendations.planting.filter(date => date.trim() !== ""),
        harvesting: recommendations.harvesting.filter(date => date.trim() !== ""),
      };

      if (filteredRecommendations.planting.length === 0 && filteredRecommendations.harvesting.length === 0) {
        toast({
          title: "No Data to Save",
          description: "Please enter at least one recommendation before saving.",
          variant: "destructive",
        });
        return;
      }

      // Clear existing recommendations
      await supabase
        .from('planting_recommendations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      // Prepare data for database
      const dataToSave = [
        ...filteredRecommendations.planting.map(date => ({
          planting_date: date,
          harvesting_date: null,
        })),
        ...filteredRecommendations.harvesting.map(date => ({
          planting_date: null,
          harvesting_date: date,
        })),
      ];

      // Insert new recommendations
      const { error } = await supabase
        .from('planting_recommendations')
        .insert(dataToSave);

      if (error) throw error;

      toast({
        title: "Recommendations Saved",
        description: "The planting recommendations have been saved successfully to the database.",
      });
    } catch (error: any) {
      console.error('Error saving recommendations:', error);
      toast({
        title: "Save Error",
        description: error.message || "Failed to save recommendations",
        variant: "destructive",
      });
    }
  };

  const handleSaveDailyRainfall = async () => {
    try {
      const filteredData = dailyRainfallData.filter(d => d.date.trim() !== "" && d.amount > 0);
      
      if (filteredData.length === 0) {
        toast({
          title: "No Data to Save",
          description: "Please enter valid dates and rainfall amounts before saving.",
          variant: "destructive",
        });
        return;
      }

      // Prepare data for database
      const dataToSave = filteredData.map(data => ({
        date: data.date,
        rainfall_amount: data.amount,
      }));

      // Delete existing data for the same dates first
      for (const data of dataToSave) {
        await supabase
          .from('daily_rainfall')
          .delete()
          .eq('date', data.date);
      }

      // Insert new data
      const { error } = await supabase
        .from('daily_rainfall')
        .insert(dataToSave);

      if (error) throw error;

      toast({
        title: "Daily Rainfall Data Saved",
        description: "The daily rainfall data has been saved successfully to the database.",
      });
    } catch (error: any) {
      console.error('Error saving daily rainfall data:', error);
      toast({
        title: "Save Error",
        description: error.message || "Failed to save daily rainfall data",
        variant: "destructive",
      });
    }
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

        <Tabs defaultValue="daily-rainfall" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily-rainfall">Daily Rainfall</TabsTrigger>
            <TabsTrigger value="recommendations">Planting Recommendations</TabsTrigger>
          </TabsList>


          <TabsContent value="daily-rainfall" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="year-select">Select Year</Label>
                <select
                  id="year-select"
                  className="rounded-md border bg-background px-3 py-2"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {existingDailyData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Existing Daily Rainfall Data ({selectedYear})</CardTitle>
                  <CardDescription>
                    Edit existing rainfall data entries. Click Save to update individual entries.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {existingDailyData.map((data, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor={`existing-date-${index}`}>Date</Label>
                          <Input
                            id={`existing-date-${index}`}
                            type="date"
                            value={data.date}
                            onChange={(e) => handleEditExistingData(index, 'date', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`existing-rainfall-${index}`}>Rainfall Amount</Label>
                          <div className="relative">
                            <Input
                              id={`existing-rainfall-${index}`}
                              type="number"
                              value={data.amount}
                              onChange={(e) => handleEditExistingData(index, 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              min="0"
                              step="0.1"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                              mm
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveExistingData(index)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteExistingData(index)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Add New Daily Rainfall Data ({selectedYear})</CardTitle>
                <CardDescription>
                  Enter rainfall amounts for specific dates in millimeters (mm).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyRainfallData.map((data, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="space-y-2">
                        <Label htmlFor={`date-${index}`}>Date</Label>
                        <Input
                          id={`date-${index}`}
                          type="date"
                          value={data.date}
                          min={`${selectedYear}-01-01`}
                          max={`${selectedYear}-12-31`}
                          onChange={(e) => handleDailyRainfallChange(index, 'date', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`daily-rainfall-${index}`}>Rainfall Amount</Label>
                        <div className="relative">
                          <Input
                            id={`daily-rainfall-${index}`}
                            type="number"
                            value={data.amount}
                            onChange={(e) => handleDailyRainfallChange(index, 'amount', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            step="0.1"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                            mm
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {dailyRainfallData.length > 1 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveDailyRainfall(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleAddDailyRainfall}
                  >
                    Add Daily Entry
                  </Button>
                  <Button onClick={handleSaveDailyRainfall}>
                    Save New Daily Rainfall Data
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