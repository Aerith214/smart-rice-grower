import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSEO } from "@/hooks/useSEO";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar,
  CloudRain, 
  Sun, 
  Droplets,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface DailyRainfallData {
  date: string;
  rainfall_amount: number;
}

interface CroppingPhase {
  name: string;
  icon: typeof Calendar;
  color: string;
  bgColor: string;
}

const SmartCroppingSystem = () => {
  useSEO({
    title: "Smart Cropping System - SmartRice",
    description: "Intelligent cropping recommendations based on rice seasons and rainfall data for optimal farming decisions."
  });

  // State
  const [currentDate] = useState(new Date());
  const [rainfallForecast, setRainfallForecast] = useState<number>(0);
  const [forecastDate, setForecastDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailyRainfall, setDailyRainfall] = useState<DailyRainfallData[]>([]);
  const [manualRainfall, setManualRainfall] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useUserRole();

  // Cropping phases definition
  const croppingPhases: Record<string, CroppingPhase> = {
    "Land Preparation": {
      name: "Land Preparation",
      icon: Calendar,
      color: "text-blue-700",
      bgColor: "bg-blue-100"
    },
    "Planting": {
      name: "Seedling Nursery / Planting",
      icon: Calendar,
      color: "text-emerald-700",
      bgColor: "bg-emerald-100"
    },
    "Growth": {
      name: "Crop Establishment / Vegetative Growth",
      icon: Calendar,
      color: "text-green-700", 
      bgColor: "bg-green-100"
    },
    "Flowering": {
      name: "Reproductive Stage (Flowering)",
      icon: Calendar,
      color: "text-yellow-700",
      bgColor: "bg-yellow-100"
    },
    "Harvest": {
      name: "Maturation / Harvesting",
      icon: Calendar,
      color: "text-orange-700",
      bgColor: "bg-orange-100"
    },
    "Post-Harvest": {
      name: "Post-Harvest (Drying, Milling, Storage)",
      icon: Calendar,
      color: "text-purple-700",
      bgColor: "bg-purple-100"
    }
  };

  // Get current season and phase
  const getCurrentSeasonAndPhase = () => {
    const month = currentDate.getMonth() + 1; // 1-12
    const day = currentDate.getDate();
    
    // Wet Season: March 16 – September 15
    if ((month === 3 && day >= 16) || (month > 3 && month < 9) || (month === 9 && day <= 15)) {
      // Determine phase within wet season
      if ((month === 3 && day >= 16) || (month === 4 && day <= 15)) {
        return { season: "Wet", phase: "Land Preparation" };
      } else if ((month === 4 && day >= 1) || (month === 4 && day <= 30)) {
        return { season: "Wet", phase: "Planting" };
      } else if (month === 5 || month === 6) {
        return { season: "Wet", phase: "Growth" };
      } else if (month === 7 || (month === 8 && day <= 15)) {
        return { season: "Wet", phase: "Flowering" };
      } else if ((month === 8 && day >= 16) || (month === 9 && day <= 15)) {
        return { season: "Wet", phase: "Harvest" };
      } else if (month === 9) {
        return { season: "Wet", phase: "Post-Harvest" };
      }
    }
    
    // Dry Season: September 16 – March 15
    else {
      if ((month === 9 && day >= 16) || (month === 10 && day <= 15)) {
        return { season: "Dry", phase: "Land Preparation" };
      } else if ((month === 10 && day >= 1) || (month === 10 && day <= 30)) {
        return { season: "Dry", phase: "Planting" };
      } else if (month === 11 || month === 12) {
        return { season: "Dry", phase: "Growth" };
      } else if (month === 1 || (month === 2 && day <= 15)) {
        return { season: "Dry", phase: "Flowering" };
      } else if ((month === 2 && day >= 16) || (month === 3 && day <= 15)) {
        return { season: "Dry", phase: "Harvest" };
      } else if (month === 3) {
        return { season: "Dry", phase: "Post-Harvest" };
      }
    }
    
    return { season: "Transition", phase: "Planning" };
  };

  const { season, phase } = getCurrentSeasonAndPhase();

  // Rainfall categorization
  const getRainfallCategory = (amount: number) => {
    if (amount > 50) return { category: "Heavy", color: "text-red-600", icon: CloudRain };
    if (amount >= 10) return { category: "Normal", color: "text-blue-600", icon: Droplets };
    return { category: "Dry", color: "text-yellow-600", icon: Sun };
  };

  const rainfallCategory = getRainfallCategory(rainfallForecast);

  // Generate recommendation
  const getRecommendation = () => {
    const rainfall = rainfallForecast;
    
    if (phase === "Land Preparation") {
      if (rainfall > 50) return { 
        text: "Delay land preparation due to heavy rainfall expected. Wait for drier conditions.", 
        type: "warning" as const,
        icon: AlertTriangle
      };
      if (rainfall >= 10) return { 
        text: "Good conditions for land preparation. Moderate rainfall will help soften soil.", 
        type: "success" as const,
        icon: CheckCircle
      };
      return { 
        text: "Good time for land preparation. Dry conditions allow proper soil cultivation.", 
        type: "success" as const,
        icon: CheckCircle
      };
    }
    
    if (phase === "Planting") {
      if (rainfall > 50) return { 
        text: "Delay planting/transplanting until rainfall subsides. Heavy rain can damage seedlings.", 
        type: "warning" as const,
        icon: AlertTriangle
      };
      if (rainfall >= 10) return { 
        text: "Excellent time to plant. Normal rainfall supports growth and establishment.", 
        type: "success" as const,
        icon: CheckCircle
      };
      return { 
        text: "Ensure adequate irrigation before planting. Low rainfall requires water management.", 
        type: "info" as const,
        icon: Clock
      };
    }
    
    if (phase === "Growth") {
      if (rainfall > 50) return { 
        text: "Monitor drainage systems. Heavy rainfall may cause waterlogging.", 
        type: "warning" as const,
        icon: AlertTriangle
      };
      if (rainfall >= 10) return { 
        text: "Optimal growing conditions. Normal rainfall promotes healthy crop development.", 
        type: "success" as const,
        icon: CheckCircle
      };
      return { 
        text: "Irrigation required. Insufficient rainfall for proper crop growth.", 
        type: "info" as const,
        icon: Clock
      };
    }
    
    if (phase === "Flowering") {
      if (rainfall > 50) return { 
        text: "Heavy rain may affect pollination. Monitor crop health closely.", 
        type: "warning" as const,
        icon: AlertTriangle
      };
      if (rainfall >= 10) return { 
        text: "Good conditions for flowering stage. Adequate moisture supports grain formation.", 
        type: "success" as const,
        icon: CheckCircle
      };
      return { 
        text: "Ensure consistent irrigation during flowering for optimal grain development.", 
        type: "info" as const,
        icon: Clock
      };
    }
    
    if (phase === "Harvest") {
      if (rainfall > 50) return { 
        text: "Harvest early to avoid losses. Heavy rain can damage mature crops.", 
        type: "warning" as const,
        icon: AlertTriangle
      };
      if (rainfall >= 10) return { 
        text: "Plan harvest carefully. Monitor weather for dry windows.", 
        type: "info" as const,
        icon: Clock
      };
      return { 
        text: "Excellent harvest conditions. Dry weather ideal for harvesting and drying.", 
        type: "success" as const,
        icon: CheckCircle
      };
    }
    
    if (phase === "Post-Harvest") {
      if (rainfall > 50) return { 
        text: "Ensure proper storage facilities. Heavy rain may affect drying process.", 
        type: "warning" as const,
        icon: AlertTriangle
      };
      return { 
        text: "Good conditions for post-harvest activities. Continue drying and storage.", 
        type: "success" as const,
        icon: CheckCircle
      };
    }
    
    return { 
      text: "Monitor conditions and prepare for upcoming season.", 
      type: "info" as const,
      icon: Clock
    };
  };

  const recommendation = getRecommendation();

  // Load recent rainfall data and check admin status
  useEffect(() => {
    const loadRainfallData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('daily_rainfall')
          .select('*')
          .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('date', { ascending: false })
          .limit(7);

        if (error) throw error;
        setDailyRainfall(data || []);
        
        // Set forecast to latest rainfall amount if available
        if (data && data.length > 0) {
          setRainfallForecast(data[0].rainfall_amount || 0);
        }
      } catch (error) {
        console.error('Error loading rainfall data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRainfallData();
  }, []);

  const handleManualRainfallUpdate = () => {
    const amount = parseFloat(manualRainfall);
    if (!isNaN(amount) && amount >= 0) {
      setRainfallForecast(amount);
      setManualRainfall("");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Smart Cropping System
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Intelligent recommendations based on rice cropping calendar and rainfall data
          </p>
        </div>

        {/* Current Status Dashboard */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Current Date & Season */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">{currentDate.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Season</p>
                <Badge variant="outline" className={`${season === 'Wet' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                  {season} Season
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phase</p>
                <Badge className={`${croppingPhases[phase]?.bgColor} ${croppingPhases[phase]?.color}`}>
                  {croppingPhases[phase]?.name || phase}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Rainfall Forecast */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <rainfallCategory.icon className="h-5 w-5" />
                Rainfall Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(forecastDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-semibold text-2xl">{rainfallForecast.toFixed(1)} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge className={`${rainfallCategory.color}`} variant="outline">
                  {rainfallCategory.category} Rain
                </Badge>
              </div>
              {isAdmin && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Update Forecast (Admin Only)</p>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={forecastDate}
                      onChange={(e) => setForecastDate(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="mm"
                        value={manualRainfall}
                        onChange={(e) => setManualRainfall(e.target.value)}
                        className="text-sm"
                      />
                      <Button size="sm" onClick={handleManualRainfallUpdate}>
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <recommendation.icon className="h-5 w-5" />
                Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={`border ${
                recommendation.type === 'success' ? 'border-green-200 bg-green-50' :
                recommendation.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <AlertDescription className={`${
                  recommendation.type === 'success' ? 'text-green-800' :
                  recommendation.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {recommendation.text}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Cropping Calendar Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Rice Cropping Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Wet Season */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600">
                  Wet Season (March 16 – September 15)
                </h3>
                <div className="space-y-2">
                  <div className={`p-3 rounded-lg ${phase === 'Land Preparation' && season === 'Wet' ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-muted/30'}`}>
                    <p className="font-medium text-sm">Land Preparation</p>
                    <p className="text-xs text-muted-foreground">March 16 – April 15</p>
                  </div>
                  <div className={`p-3 rounded-lg ${phase === 'Planting' && season === 'Wet' ? 'ring-2 ring-emerald-500 bg-emerald-50' : 'bg-muted/30'}`}>
                    <p className="font-medium text-sm">Planting</p>
                    <p className="text-xs text-muted-foreground">April 1 – April 30</p>
                  </div>
                  <div className={`p-3 rounded-lg ${phase === 'Growth' && season === 'Wet' ? 'ring-2 ring-green-500 bg-green-50' : 'bg-muted/30'}`}>
                    <p className="font-medium text-sm">Growth</p>
                    <p className="text-xs text-muted-foreground">May – June</p>
                  </div>
                  <div className={`p-3 rounded-lg ${phase === 'Flowering' && season === 'Wet' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'bg-muted/30'}`}>
                    <p className="font-medium text-sm">Flowering</p>
                    <p className="text-xs text-muted-foreground">July – early August</p>
                  </div>
                  <div className={`p-3 rounded-lg ${phase === 'Harvest' && season === 'Wet' ? 'ring-2 ring-orange-500 bg-orange-50' : 'bg-muted/30'}`}>
                    <p className="font-medium text-sm">Harvest</p>
                    <p className="text-xs text-muted-foreground">Mid-August – September 15</p>
                  </div>
                  <div className={`p-3 rounded-lg ${phase === 'Post-Harvest' && season === 'Wet' ? 'ring-2 ring-purple-500 bg-purple-50' : 'bg-muted/30'}`}>
                    <p className="font-medium text-sm">Post-Harvest</p>
                    <p className="text-xs text-muted-foreground">September</p>
                  </div>
                </div>
              </div>

              {/* Dry Season */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-600">
                  Dry Season (September 16 – March 15)
                </h3>
                <div className="space-y-2">
                  <div className={`p-3 rounded-lg ${phase === 'Land Preparation' && season === 'Dry' ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-muted/30'}`}>
                    <p className="font-medium text-sm">Land Preparation</p>
                    <p className="text-xs text-muted-foreground">September 16 – October 15</p>
                  </div>
                  <div className={`p-3 rounded-lg ${phase === 'Planting' && season === 'Dry' ? 'ring-2 ring-emerald-500 bg-emerald-50' : 'bg-muted/30'}`}>
                    <p className="font-medium text-sm">Planting</p>
                    <p className="text-xs text-muted-foreground">October 1 – October 30</p>
                  </div>
                  <div className={`p-3 rounded-lg ${phase === 'Growth' && season === 'Dry' ? 'ring-2 ring-green-500 bg-green-50' : 'bg-muted/30'}`}>
                    <p className="font-medium text-sm">Growth</p>
                    <p className="text-xs text-muted-foreground">November – December</p>
                  </div>
                  <div className={`p-3 rounded-lg ${phase === 'Flowering' && season === 'Dry' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'bg-muted/30'}`}>
                    <p className="font-medium text-sm">Flowering</p>
                    <p className="text-xs text-muted-foreground">January – early February</p>
                  </div>
                  <div className={`p-3 rounded-lg ${phase === 'Harvest' && season === 'Dry' ? 'ring-2 ring-orange-500 bg-orange-50' : 'bg-muted/30'}`}>
                    <p className="font-medium text-sm">Harvest</p>
                    <p className="text-xs text-muted-foreground">Mid-February – March 15</p>
                  </div>
                  <div className={`p-3 rounded-lg ${phase === 'Post-Harvest' && season === 'Dry' ? 'ring-2 ring-purple-500 bg-purple-50' : 'bg-muted/30'}`}>
                    <p className="font-medium text-sm">Post-Harvest</p>
                    <p className="text-xs text-muted-foreground">March</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Rainfall Data */}
        {dailyRainfall.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Rainfall Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {dailyRainfall.map((record, index) => {
                  const category = getRainfallCategory(record.rainfall_amount);
                  return (
                    <div key={index} className="text-center space-y-2">
                      <div className={`p-3 rounded-lg border ${
                        category.category === 'Heavy' ? 'bg-red-50 border-red-200' :
                        category.category === 'Normal' ? 'bg-blue-50 border-blue-200' :
                        'bg-yellow-50 border-yellow-200'
                      }`}>
                        <category.icon className={`h-6 w-6 mx-auto ${category.color}`} />
                        <p className="text-lg font-semibold">{record.rainfall_amount.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">mm</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SmartCroppingSystem;