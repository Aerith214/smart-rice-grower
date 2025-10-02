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

interface DatabaseRecommendation {
  id: string;
  planting_date: string | null;
  harvesting_date: string | null;
  created_at: string;
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
  
  const [dbRecommendations, setDbRecommendations] = useState<DatabaseRecommendation[]>([]);
  const [editingRecommendation, setEditingRecommendation] = useState<DatabaseRecommendation | null>(null);

  // Load existing recommendations from database
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const { data, error } = await supabase
          .from('planting_recommendations')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setDbRecommendations(data || []);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      }
    };

    loadRecommendations();
  }, []);

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

  const handleLoad2015Data = async () => {
    const rainfall2015Data = [
      // January
      { date: "2015-01-01", amount: 0.8 }, { date: "2015-01-02", amount: 2.1 }, { date: "2015-01-03", amount: 0.3 },
      { date: "2015-01-04", amount: 0.0 }, { date: "2015-01-05", amount: 0.0 }, { date: "2015-01-06", amount: 0.0 },
      { date: "2015-01-07", amount: 0.0 }, { date: "2015-01-08", amount: 0.0 }, { date: "2015-01-09", amount: 4.8 },
      { date: "2015-01-10", amount: 0.0 }, { date: "2015-01-11", amount: 1.0 }, { date: "2015-01-12", amount: 0.8 },
      { date: "2015-01-13", amount: 1.8 }, { date: "2015-01-14", amount: 0.0 }, { date: "2015-01-15", amount: 0.0 },
      { date: "2015-01-16", amount: 1.8 }, { date: "2015-01-17", amount: 0.0 }, { date: "2015-01-18", amount: 0.0 },
      { date: "2015-01-19", amount: 23.2 }, { date: "2015-01-20", amount: 0.0 }, { date: "2015-01-21", amount: 1.2 },
      { date: "2015-01-22", amount: 0.0 }, { date: "2015-01-23", amount: 0.4 }, { date: "2015-01-24", amount: 0.0 },
      { date: "2015-01-25", amount: 0.0 }, { date: "2015-01-26", amount: 0.0 }, { date: "2015-01-27", amount: 0.0 },
      { date: "2015-01-28", amount: 0.0 }, { date: "2015-01-29", amount: 0.0 }, { date: "2015-01-30", amount: 0.0 },
      { date: "2015-01-31", amount: 0.0 },
      
      // February
      { date: "2015-02-01", amount: 2.3 }, { date: "2015-02-02", amount: 0.0 }, { date: "2015-02-03", amount: 1.8 },
      { date: "2015-02-04", amount: 0.0 }, { date: "2015-02-05", amount: 0.0 }, { date: "2015-02-06", amount: 0.0 },
      { date: "2015-02-07", amount: 0.0 }, { date: "2015-02-08", amount: 2.0 }, { date: "2015-02-09", amount: 0.0 },
      { date: "2015-02-10", amount: 0.6 }, { date: "2015-02-11", amount: 0.0 }, { date: "2015-02-12", amount: 0.0 },
      { date: "2015-02-13", amount: 1.0 }, { date: "2015-02-14", amount: 0.6 }, { date: "2015-02-15", amount: 6.5 },
      { date: "2015-02-16", amount: 9.8 }, { date: "2015-02-17", amount: 0.0 }, { date: "2015-02-18", amount: 8.2 },
      { date: "2015-02-19", amount: 3.6 }, { date: "2015-02-20", amount: 7.4 }, { date: "2015-02-21", amount: 0.0 },
      { date: "2015-02-22", amount: 0.0 }, { date: "2015-02-23", amount: 0.0 }, { date: "2015-02-24", amount: 0.0 },
      { date: "2015-02-25", amount: 0.0 }, { date: "2015-02-26", amount: 0.0 }, { date: "2015-02-27", amount: 0.0 },
      { date: "2015-02-28", amount: 0.0 },
      
      // March
      { date: "2015-03-01", amount: 0.0 }, { date: "2015-03-02", amount: 0.0 }, { date: "2015-03-03", amount: 0.0 },
      { date: "2015-03-04", amount: 0.0 }, { date: "2015-03-05", amount: 0.0 }, { date: "2015-03-06", amount: 0.0 },
      { date: "2015-03-07", amount: 0.0 }, { date: "2015-03-08", amount: 0.0 }, { date: "2015-03-09", amount: 0.0 },
      { date: "2015-03-10", amount: 0.0 }, { date: "2015-03-11", amount: 0.2 }, { date: "2015-03-12", amount: 0.8 },
      { date: "2015-03-13", amount: 0.4 }, { date: "2015-03-14", amount: 0.8 }, { date: "2015-03-15", amount: 0.0 },
      { date: "2015-03-16", amount: 0.0 }, { date: "2015-03-17", amount: 0.0 }, { date: "2015-03-18", amount: 0.0 },
      { date: "2015-03-19", amount: 0.0 }, { date: "2015-03-20", amount: 0.0 }, { date: "2015-03-21", amount: 0.0 },
      { date: "2015-03-22", amount: 0.0 }, { date: "2015-03-23", amount: 7.4 }, { date: "2015-03-24", amount: 0.0 },
      { date: "2015-03-25", amount: 0.9 }, { date: "2015-03-26", amount: 18.5 }, { date: "2015-03-27", amount: 11.9 },
      { date: "2015-03-28", amount: 0.2 }, { date: "2015-03-29", amount: 0.8 }, { date: "2015-03-30", amount: 0.0 },
      { date: "2015-03-31", amount: 0.0 },
      
      // April
      { date: "2015-04-01", amount: 0.0 }, { date: "2015-04-02", amount: 0.0 }, { date: "2015-04-03", amount: 0.0 },
      { date: "2015-04-04", amount: 0.0 }, { date: "2015-04-05", amount: 1.0 }, { date: "2015-04-06", amount: 27.0 },
      { date: "2015-04-07", amount: 4.6 }, { date: "2015-04-08", amount: 0.0 }, { date: "2015-04-09", amount: 0.0 },
      { date: "2015-04-10", amount: 0.0 }, { date: "2015-04-11", amount: 0.0 }, { date: "2015-04-12", amount: 0.0 },
      { date: "2015-04-13", amount: 0.0 }, { date: "2015-04-14", amount: 0.01 }, { date: "2015-04-15", amount: 0.0 },
      { date: "2015-04-16", amount: 0.0 }, { date: "2015-04-17", amount: 39.6 }, { date: "2015-04-18", amount: 1.8 },
      { date: "2015-04-19", amount: 0.0 }, { date: "2015-04-20", amount: 0.4 }, { date: "2015-04-21", amount: 1.0 },
      { date: "2015-04-22", amount: 2.6 }, { date: "2015-04-23", amount: 0.8 }, { date: "2015-04-24", amount: 0.0 },
      { date: "2015-04-25", amount: 0.8 }, { date: "2015-04-26", amount: 0.0 }, { date: "2015-04-27", amount: 0.0 },
      { date: "2015-04-28", amount: 0.0 }, { date: "2015-04-29", amount: 0.8 }, { date: "2015-04-30", amount: 0.3 },
      
      // May
      { date: "2015-05-01", amount: 1.0 }, { date: "2015-05-02", amount: 0.0 }, { date: "2015-05-03", amount: 0.0 },
      { date: "2015-05-04", amount: 0.0 }, { date: "2015-05-05", amount: 27.4 }, { date: "2015-05-06", amount: 1.2 },
      { date: "2015-05-07", amount: 12.3 }, { date: "2015-05-08", amount: 0.0 }, { date: "2015-05-09", amount: 0.0 },
      { date: "2015-05-10", amount: 0.01 }, { date: "2015-05-11", amount: 0.0 }, { date: "2015-05-12", amount: 0.0 },
      { date: "2015-05-13", amount: 24.8 }, { date: "2015-05-14", amount: 0.0 }, { date: "2015-05-15", amount: 0.0 },
      { date: "2015-05-16", amount: 0.0 }, { date: "2015-05-17", amount: 0.0 }, { date: "2015-05-18", amount: 0.0 },
      { date: "2015-05-19", amount: 0.0 }, { date: "2015-05-20", amount: 0.0 }, { date: "2015-05-21", amount: 0.0 },
      { date: "2015-05-22", amount: 0.0 }, { date: "2015-05-23", amount: 0.0 }, { date: "2015-05-24", amount: 0.0 },
      { date: "2015-05-25", amount: 3.8 }, { date: "2015-05-26", amount: 21.9 }, { date: "2015-05-27", amount: 4.8 },
      { date: "2015-05-28", amount: 0.0 }, { date: "2015-05-29", amount: 1.4 }, { date: "2015-05-30", amount: 6.8 },
      { date: "2015-05-31", amount: 6.6 },
      
      // June
      { date: "2015-06-01", amount: 3.2 }, { date: "2015-06-02", amount: 21.5 }, { date: "2015-06-03", amount: 0.0 },
      { date: "2015-06-04", amount: 0.0 }, { date: "2015-06-05", amount: 0.0 }, { date: "2015-06-06", amount: 0.0 },
      { date: "2015-06-07", amount: 5.2 }, { date: "2015-06-08", amount: 0.0 }, { date: "2015-06-09", amount: 0.0 },
      { date: "2015-06-10", amount: 2.2 }, { date: "2015-06-11", amount: 0.0 }, { date: "2015-06-12", amount: 0.0 },
      { date: "2015-06-13", amount: 0.0 }, { date: "2015-06-14", amount: 0.0 }, { date: "2015-06-15", amount: 0.0 },
      { date: "2015-06-16", amount: 0.0 }, { date: "2015-06-17", amount: 0.0 }, { date: "2015-06-18", amount: 34.4 },
      { date: "2015-06-19", amount: 30.4 }, { date: "2015-06-20", amount: 0.0 }, { date: "2015-06-21", amount: 1.4 },
      { date: "2015-06-22", amount: 0.0 }, { date: "2015-06-23", amount: 0.0 }, { date: "2015-06-24", amount: 0.0 },
      { date: "2015-06-25", amount: 0.4 }, { date: "2015-06-26", amount: 1.4 }, { date: "2015-06-27", amount: 0.0 },
      { date: "2015-06-28", amount: 6.4 }, { date: "2015-06-29", amount: 0.5 }, { date: "2015-06-30", amount: 0.1 },
      
      // July
      { date: "2015-07-01", amount: 9.9 }, { date: "2015-07-02", amount: 30.8 }, { date: "2015-07-03", amount: 0.0 },
      { date: "2015-07-04", amount: 1.2 }, { date: "2015-07-05", amount: 60.2 }, { date: "2015-07-06", amount: 14.6 },
      { date: "2015-07-07", amount: 0.0 }, { date: "2015-07-08", amount: 0.0 }, { date: "2015-07-09", amount: 0.1 },
      { date: "2015-07-10", amount: 13.2 }, { date: "2015-07-11", amount: 2.4 }, { date: "2015-07-12", amount: 0.2 },
      { date: "2015-07-13", amount: 0.2 }, { date: "2015-07-14", amount: 4.8 }, { date: "2015-07-15", amount: 3.8 },
      { date: "2015-07-16", amount: 0.6 }, { date: "2015-07-17", amount: 8.8 }, { date: "2015-07-18", amount: 5.4 },
      { date: "2015-07-19", amount: 2.2 }, { date: "2015-07-20", amount: 0.0 }, { date: "2015-07-21", amount: 33.8 },
      { date: "2015-07-22", amount: 0.0 }, { date: "2015-07-23", amount: 34.0 }, { date: "2015-07-24", amount: 2.5 },
      { date: "2015-07-25", amount: 0.0 }, { date: "2015-07-26", amount: 6.9 }, { date: "2015-07-27", amount: 16.8 },
      { date: "2015-07-28", amount: 20.2 }, { date: "2015-07-29", amount: 1.3 }, { date: "2015-07-30", amount: 7.2 },
      { date: "2015-07-31", amount: 0.0 },
      
      // August
      { date: "2015-08-01", amount: 0.0 }, { date: "2015-08-02", amount: 0.0 }, { date: "2015-08-03", amount: 0.0 },
      { date: "2015-08-04", amount: 0.0 }, { date: "2015-08-05", amount: 0.0 }, { date: "2015-08-06", amount: 12.8 },
      { date: "2015-08-07", amount: 0.0 }, { date: "2015-08-08", amount: 0.0 }, { date: "2015-08-09", amount: 0.0 },
      { date: "2015-08-10", amount: 0.0 }, { date: "2015-08-11", amount: 8.0 }, { date: "2015-08-12", amount: 8.5 },
      { date: "2015-08-13", amount: 43.6 }, { date: "2015-08-14", amount: 75.6 }, { date: "2015-08-15", amount: 6.5 },
      { date: "2015-08-16", amount: 0.2 }, { date: "2015-08-17", amount: 2.9 }, { date: "2015-08-18", amount: 1.5 },
      { date: "2015-08-19", amount: 17.9 }, { date: "2015-08-20", amount: 27.2 }, { date: "2015-08-21", amount: 7.7 },
      { date: "2015-08-22", amount: 2.4 }, { date: "2015-08-23", amount: 1.5 }, { date: "2015-08-24", amount: 0.0 },
      { date: "2015-08-25", amount: 0.0 }, { date: "2015-08-26", amount: 0.2 }, { date: "2015-08-27", amount: 0.0 },
      { date: "2015-08-28", amount: 57.0 }, { date: "2015-08-29", amount: 7.2 }, { date: "2015-08-30", amount: 7.9 },
      { date: "2015-08-31", amount: 6.6 },
      
      // September
      { date: "2015-09-01", amount: 3.2 }, { date: "2015-09-02", amount: 10.2 }, { date: "2015-09-03", amount: 1.8 },
      { date: "2015-09-04", amount: 5.0 }, { date: "2015-09-05", amount: 1.0 }, { date: "2015-09-06", amount: 4.6 },
      { date: "2015-09-07", amount: 14.4 }, { date: "2015-09-08", amount: 5.0 }, { date: "2015-09-09", amount: 42.0 },
      { date: "2015-09-10", amount: 39.5 }, { date: "2015-09-11", amount: 16.2 }, { date: "2015-09-12", amount: 3.3 },
      { date: "2015-09-13", amount: 2.4 }, { date: "2015-09-14", amount: 1.6 }, { date: "2015-09-15", amount: 6.2 },
      { date: "2015-09-16", amount: 0.0 }, { date: "2015-09-17", amount: 0.0 }, { date: "2015-09-18", amount: 0.0 },
      { date: "2015-09-19", amount: 0.0 }, { date: "2015-09-20", amount: 0.0 }, { date: "2015-09-21", amount: 0.0 },
      { date: "2015-09-22", amount: 0.4 }, { date: "2015-09-23", amount: 0.0 }, { date: "2015-09-24", amount: 0.0 },
      { date: "2015-09-25", amount: 3.2 }, { date: "2015-09-26", amount: 65.4 }, { date: "2015-09-27", amount: 45.8 },
      { date: "2015-09-28", amount: 2.0 }, { date: "2015-09-29", amount: 0.0 }, { date: "2015-09-30", amount: 0.0 },
      
      // October
      { date: "2015-10-01", amount: 0.2 }, { date: "2015-10-02", amount: 51.6 }, { date: "2015-10-03", amount: 0.0 },
      { date: "2015-10-04", amount: 1.4 }, { date: "2015-10-05", amount: 2.0 }, { date: "2015-10-06", amount: 0.2 },
      { date: "2015-10-07", amount: 0.0 }, { date: "2015-10-08", amount: 0.2 }, { date: "2015-10-09", amount: 1.8 },
      { date: "2015-10-10", amount: 2.4 }, { date: "2015-10-11", amount: 38.8 }, { date: "2015-10-12", amount: 18.9 },
      { date: "2015-10-13", amount: 0.9 }, { date: "2015-10-14", amount: 28.2 }, { date: "2015-10-15", amount: 11.0 },
      { date: "2015-10-16", amount: 0.0 }, { date: "2015-10-17", amount: 13.4 }, { date: "2015-10-18", amount: 69.8 },
      { date: "2015-10-19", amount: 63.1 }, { date: "2015-10-20", amount: 0.5 }, { date: "2015-10-21", amount: 0.0 },
      { date: "2015-10-22", amount: 0.0 }, { date: "2015-10-23", amount: 0.0 }, { date: "2015-10-24", amount: 0.0 },
      { date: "2015-10-25", amount: 0.0 }, { date: "2015-10-26", amount: 0.0 }, { date: "2015-10-27", amount: 0.0 },
      { date: "2015-10-28", amount: 0.0 }, { date: "2015-10-29", amount: 0.0 }, { date: "2015-10-30", amount: 0.2 },
      { date: "2015-10-31", amount: 2.0 },
      
      // November
      { date: "2015-11-01", amount: 0.5 }, { date: "2015-11-02", amount: 13.6 }, { date: "2015-11-03", amount: 1.5 },
      { date: "2015-11-04", amount: 0.0 }, { date: "2015-11-05", amount: 0.01 }, { date: "2015-11-06", amount: 9.5 },
      { date: "2015-11-07", amount: 3.0 }, { date: "2015-11-08", amount: 0.01 }, { date: "2015-11-09", amount: 0.01 },
      { date: "2015-11-10", amount: 0.0 }, { date: "2015-11-11", amount: 0.0 }, { date: "2015-11-12", amount: 0.0 },
      { date: "2015-11-13", amount: 0.0 }, { date: "2015-11-14", amount: 0.0 }, { date: "2015-11-15", amount: 0.0 },
      { date: "2015-11-16", amount: 0.0 }, { date: "2015-11-17", amount: 0.0 }, { date: "2015-11-18", amount: 0.0 },
      { date: "2015-11-19", amount: 0.0 }, { date: "2015-11-20", amount: 0.2 }, { date: "2015-11-21", amount: 0.0 },
      { date: "2015-11-22", amount: 0.0 }, { date: "2015-11-23", amount: 0.0 }, { date: "2015-11-24", amount: 0.0 },
      { date: "2015-11-25", amount: 0.0 }, { date: "2015-11-26", amount: 0.2 }, { date: "2015-11-27", amount: 1.0 },
      { date: "2015-11-28", amount: 4.1 }, { date: "2015-11-29", amount: 0.0 }, { date: "2015-11-30", amount: 0.0 },
      
      // December
      { date: "2015-12-01", amount: 0.0 }, { date: "2015-12-02", amount: 0.0 }, { date: "2015-12-03", amount: 0.01 },
      { date: "2015-12-04", amount: 0.4 }, { date: "2015-12-05", amount: 0.4 }, { date: "2015-12-06", amount: 0.01 },
      { date: "2015-12-07", amount: 2.4 }, { date: "2015-12-08", amount: 2.9 }, { date: "2015-12-09", amount: 0.0 },
      { date: "2015-12-10", amount: 0.0 }, { date: "2015-12-11", amount: 0.0 }, { date: "2015-12-12", amount: 0.0 },
      { date: "2015-12-13", amount: 0.0 }, { date: "2015-12-14", amount: 2.5 }, { date: "2015-12-15", amount: 113.0 },
      { date: "2015-12-16", amount: 148.0 }, { date: "2015-12-17", amount: 13.6 }, { date: "2015-12-18", amount: 2.6 },
      { date: "2015-12-19", amount: 13.1 }, { date: "2015-12-20", amount: 42.4 }, { date: "2015-12-21", amount: 21.2 },
      { date: "2015-12-22", amount: 0.01 }, { date: "2015-12-23", amount: 0.0 }, { date: "2015-12-24", amount: 0.0 },
      { date: "2015-12-25", amount: 0.0 }, { date: "2015-12-26", amount: 0.0 }, { date: "2015-12-27", amount: 0.0 },
      { date: "2015-12-28", amount: 0.4 }, { date: "2015-12-29", amount: 5.3 }, { date: "2015-12-30", amount: 4.9 },
      { date: "2015-12-31", amount: 0.01 }
    ];

    try {
      // Delete existing 2015 data first
      await supabase
        .from('daily_rainfall')
        .delete()
        .gte('date', '2015-01-01')
        .lte('date', '2015-12-31');

      // Insert the 2015 data
      const dataToSave = rainfall2015Data.map(data => ({
        date: data.date,
        rainfall_amount: data.amount,
      }));

      const { error } = await supabase
        .from('daily_rainfall')
        .insert(dataToSave);

      if (error) throw error;

      toast({
        title: "2015 Data Loaded",
        description: `Successfully loaded ${rainfall2015Data.length} official 2015 rainfall entries.`,
      });
    } catch (error: any) {
      console.error('Error loading 2015 data:', error);
      toast({
        title: "Load Error",
        description: error.message || "Failed to load 2015 data",
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

      // Prepare data for database - create separate records for planting and harvesting
      const dataToSave = [];
      
      // Add planting dates
      for (const plantingDate of filteredRecommendations.planting) {
        dataToSave.push({
          planting_date: plantingDate,
          harvesting_date: null,
          created_by: user?.id || null,
        });
      }
      
      // Add harvesting dates
      for (const harvestingDate of filteredRecommendations.harvesting) {
        dataToSave.push({
          planting_date: null,
          harvesting_date: harvestingDate,
          created_by: user?.id || null,
        });
      }

      // Insert new recommendations
      const { error } = await supabase
        .from('planting_recommendations')
        .insert(dataToSave);

      if (error) throw error;

      // Reload recommendations to show updated list
      const { data: updatedData } = await supabase
        .from('planting_recommendations')
        .select('*')
        .order('created_at', { ascending: false });
      setDbRecommendations(updatedData || []);

      // Reset form
      setRecommendations({ planting: [""], harvesting: [""] });

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

  const handleEditRecommendation = (recommendation: DatabaseRecommendation) => {
    setEditingRecommendation(recommendation);
  };

  const handleUpdateRecommendation = async (id: string, planting_date: string | null, harvesting_date: string | null) => {
    try {
      const { error } = await supabase
        .from('planting_recommendations')
        .update({ planting_date, harvesting_date })
        .eq('id', id);

      if (error) throw error;

      // Reload recommendations
      const { data: updatedData } = await supabase
        .from('planting_recommendations')
        .select('*')
        .order('created_at', { ascending: false });
      setDbRecommendations(updatedData || []);
      setEditingRecommendation(null);

      toast({
        title: "Recommendation Updated",
        description: "The recommendation has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating recommendation:', error);
      toast({
        title: "Update Error",
        description: error.message || "Failed to update recommendation",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('planting_recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Reload recommendations
      const { data: updatedData } = await supabase
        .from('planting_recommendations')
        .select('*')
        .order('created_at', { ascending: false });
      setDbRecommendations(updatedData || []);

      toast({
        title: "Recommendation Deleted",
        description: "The recommendation has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting recommendation:', error);
      toast({
        title: "Delete Error",
        description: error.message || "Failed to delete recommendation",
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
                <CardTitle>2015 Official Rainfall Data</CardTitle>
                <CardDescription>
                  Click to load the official 2015 rainfall data from Bayombong Nueva Vizcaya
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={handleLoad2015Data} 
                    className="w-full"
                    disabled={selectedYear !== 2015}
                  >
                    {selectedYear === 2015 ? 'Load 2015 Official Data' : 'Select Year 2015 to Load Official Data'}
                  </Button>
                  
                  {selectedYear === 2015 && (
                    <div className="text-sm text-muted-foreground">
                      This will load the complete 2015 rainfall data from the official Bayombong Nueva Vizcaya records.
                    </div>
                  )}
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
            {/* Existing Database Recommendations */}
            {dbRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Existing Recommendations</CardTitle>
                  <CardDescription>
                    Manage existing planting and harvesting recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dbRecommendations.map((rec) => (
                      <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          {editingRecommendation?.id === rec.id ? (
                            <div className="flex gap-2">
                              <Input
                                type="date"
                                value={editingRecommendation.planting_date || ''}
                                onChange={(e) => setEditingRecommendation({
                                  ...editingRecommendation,
                                  planting_date: e.target.value || null
                                })}
                                placeholder="Planting date"
                              />
                              <Input
                                type="date"
                                value={editingRecommendation.harvesting_date || ''}
                                onChange={(e) => setEditingRecommendation({
                                  ...editingRecommendation,
                                  harvesting_date: e.target.value || null
                                })}
                                placeholder="Harvesting date"
                              />
                            </div>
                          ) : (
                            <div className="flex gap-4">
                              {rec.planting_date && (
                                <span className="text-green-600">
                                  🌱 Plant: {new Date(rec.planting_date).toLocaleDateString()}
                                </span>
                              )}
                              {rec.harvesting_date && (
                                <span className="text-orange-600">
                                  🌾 Harvest: {new Date(rec.harvesting_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {editingRecommendation?.id === rec.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateRecommendation(
                                  rec.id,
                                  editingRecommendation.planting_date,
                                  editingRecommendation.harvesting_date
                                )}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingRecommendation(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditRecommendation(rec)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteRecommendation(rec.id)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add New Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Planting Dates</CardTitle>
                  <CardDescription>
                    Add new recommended planting dates for rice farming.
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
                  <CardTitle>Add Harvesting Dates</CardTitle>
                  <CardDescription>
                    Add new recommended harvesting dates for rice farming.
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
                Save New Recommendations
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Admin;