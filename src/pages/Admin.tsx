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
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [editDate, setEditDate] = useState<string>("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [bulkData, setBulkData] = useState<string>("");
  const [parsedBulkData, setParsedBulkData] = useState<DailyRainfallData[]>([]);
  
  // Generate year options from 2015 to present
  const years = Array.from({ length: new Date().getFullYear() - 2014 }, (_, i) => 2015 + i);

  const [recommendations, setRecommendations] = useState<RecommendationData>({
    planting: [""],
    harvesting: [""],
  });

  const handleLoadExistingData = async () => {
    if (!editDate) {
      toast({
        title: "Select Date",
        description: "Please select a date to load.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('daily_rainfall')
        .select('*')
        .eq('date', editDate)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setEditAmount(data.rainfall_amount || 0);
        toast({
          title: "Data Loaded",
          description: `Loaded data for ${editDate}`,
        });
      } else {
        setEditAmount(0);
        toast({
          title: "No Data Found",
          description: `No rainfall data found for ${editDate}`,
        });
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Load Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      });
    }
  };

  const handleSaveEditedData = async () => {
    if (!editDate) {
      toast({
        title: "Select Date",
        description: "Please select a date to save.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('daily_rainfall')
        .upsert({ 
          date: editDate, 
          rainfall_amount: editAmount 
        });

      if (error) throw error;

      toast({
        title: "Data Saved",
        description: `Rainfall data for ${editDate} has been saved.`,
      });
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast({
        title: "Save Error",
        description: error.message || "Failed to save data",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEditedData = async () => {
    if (!editDate) {
      toast({
        title: "Select Date",
        description: "Please select a date to delete.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('daily_rainfall')
        .delete()
        .eq('date', editDate);

      if (error) throw error;

      setEditAmount(0);
      toast({
        title: "Data Deleted",
        description: `Rainfall data for ${editDate} has been deleted.`,
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

  const handleParseBulkData = () => {
    if (!bulkData.trim()) {
      toast({
        title: "No Data",
        description: "Please paste your rainfall data first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = bulkData.trim().split('\n');
      const parsed: DailyRainfallData[] = [];
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      lines.forEach((line, lineIndex) => {
        if (lineIndex === 0) return; // Skip header if present
        if (line.includes('Mo. Total') || line.includes('Average')) return; // Skip summary rows
        
        const cells = line.split(/\s+/);
        if (cells.length < 2) return;
        
        const day = parseInt(cells[0]);
        if (isNaN(day) || day < 1 || day > 31) return;
        
        for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
          const valueIndex = monthIndex + 1;
          if (valueIndex < cells.length) {
            let value = cells[valueIndex];
            if (value === 'T') value = '0.01'; // Convert trace to small amount
            if (value === '0.00') value = '0';
            
            const amount = parseFloat(value);
            if (!isNaN(amount) && amount >= 0) {
              const month = monthIndex + 1;
              const dateStr = `${selectedYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              
              // Check if this date is valid
              const testDate = new Date(dateStr);
              if (testDate.getFullYear() === selectedYear && 
                  testDate.getMonth() === monthIndex && 
                  testDate.getDate() === day) {
                parsed.push({
                  date: dateStr,
                  amount: amount
                });
              }
            }
          }
        }
      });
      
      setParsedBulkData(parsed);
      toast({
        title: "Data Parsed",
        description: `Successfully parsed ${parsed.length} rainfall entries.`,
      });
    } catch (error: any) {
      console.error('Error parsing bulk data:', error);
      toast({
        title: "Parse Error",
        description: "Failed to parse the rainfall data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleSaveBulkData = async () => {
    if (parsedBulkData.length === 0) {
      toast({
        title: "No Data",
        description: "Please parse the data first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete existing data for these dates first
      const dates = parsedBulkData.map(d => d.date);
      await supabase
        .from('daily_rainfall')
        .delete()
        .in('date', dates);

      // Insert new data
      const dataToSave = parsedBulkData.map(data => ({
        date: data.date,
        rainfall_amount: data.amount,
      }));

      const { error } = await supabase
        .from('daily_rainfall')
        .insert(dataToSave);

      if (error) throw error;

      setBulkData("");
      setParsedBulkData([]);
      toast({
        title: "Bulk Data Saved",
        description: `Successfully saved ${dataToSave.length} rainfall entries.`,
      });
    } catch (error: any) {
      console.error('Error saving bulk data:', error);
      toast({
        title: "Save Error",
        description: error.message || "Failed to save bulk data",
        variant: "destructive",
      });
    }
  };

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }


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

            <Card>
              <CardHeader>
                <CardTitle>Edit Existing Daily Rainfall Data ({selectedYear})</CardTitle>
                <CardDescription>
                  Select a date to edit its rainfall data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="edit-date">Select Date to Edit</Label>
                      <Input
                        id="edit-date"
                        type="date"
                        value={editDate}
                        min={`${selectedYear}-01-01`}
                        max={`${selectedYear}-12-31`}
                        onChange={(e) => setEditDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-rainfall">Rainfall Amount</Label>
                      <div className="relative">
                        <Input
                          id="edit-rainfall"
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
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
                      <Button onClick={handleLoadExistingData}>
                        Load
                      </Button>
                      <Button onClick={handleSaveEditedData}>
                        Save
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteEditedData}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk Import Rainfall Data ({selectedYear})</CardTitle>
                <CardDescription>
                  Paste tabular rainfall data. Use "T" for trace amounts. Format: rows are days, columns are months.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-data">Paste Rainfall Data Table</Label>
                    <textarea
                      id="bulk-data"
                      className="w-full h-32 p-3 border rounded-md resize-none font-mono text-sm"
                      placeholder="Paste your rainfall data table here..."
                      value={bulkData}
                      onChange={(e) => setBulkData(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleParseBulkData}>
                    Parse & Preview Data
                  </Button>
                  {parsedBulkData.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Parsed {parsedBulkData.length} entries. Preview first 10:
                      </p>
                      <div className="max-h-32 overflow-y-auto border rounded p-2 text-sm">
                        {parsedBulkData.slice(0, 10).map((entry, index) => (
                          <div key={index}>
                            {entry.date}: {entry.amount}mm
                          </div>
                        ))}
                        {parsedBulkData.length > 10 && <div>... and {parsedBulkData.length - 10} more</div>}
                      </div>
                      <Button onClick={handleSaveBulkData} className="mt-2">
                        Save All {parsedBulkData.length} Entries
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Individual Daily Rainfall Data ({selectedYear})</CardTitle>
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