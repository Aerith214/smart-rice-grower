import { useSEO } from "@/hooks/useSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RiceCroppingCalendar = () => {
  useSEO({
    title: "Rice Cropping Calendar - SmartRice",
    description: "Comprehensive rice cropping calendar showing wet and dry season activities with detailed timing for optimal rice production."
  });

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const activities = [
    { name: "Land Preparation", color: "bg-blue-100 text-blue-800", stage: "preparation" },
    { name: "Seedling Nursery / Planting", color: "bg-emerald-100 text-emerald-800", stage: "planting" },
    { name: "Crop Establishment / Vegetative Growth", color: "bg-green-100 text-green-800", stage: "growth" },
    { name: "Reproductive Stage (Flowering)", color: "bg-yellow-100 text-yellow-800", stage: "flowering" },
    { name: "Maturation / Harvesting", color: "bg-orange-100 text-orange-800", stage: "harvest" },
    { name: "Post-Harvest (Drying, Milling, Storage)", color: "bg-purple-100 text-purple-800", stage: "post-harvest" }
  ];

  // Define activity periods
  const wetSeasonPeriods = {
    "Land Preparation": [2, 3], // Mar-Apr (0-indexed: 2-3)
    "Seedling Nursery / Planting": [3], // Apr
    "Crop Establishment / Vegetative Growth": [4, 5], // May-Jun
    "Reproductive Stage (Flowering)": [6, 7], // Jul-early Aug
    "Maturation / Harvesting": [7, 8], // Mid Aug-Sep
    "Post-Harvest (Drying, Milling, Storage)": [8] // Sep
  };

  const drySeasonPeriods = {
    "Land Preparation": [8, 9], // Sep-Oct
    "Seedling Nursery / Planting": [9], // Oct
    "Crop Establishment / Vegetative Growth": [10, 11], // Nov-Dec
    "Reproductive Stage (Flowering)": [0, 1], // Jan-early Feb
    "Maturation / Harvesting": [1, 2], // Mid Feb-Mar
    "Post-Harvest (Drying, Milling, Storage)": [2] // Mar
  };

  const isActivityInMonth = (activity: string, monthIndex: number, season: 'wet' | 'dry') => {
    const periods = season === 'wet' ? wetSeasonPeriods : drySeasonPeriods;
    return periods[activity as keyof typeof periods]?.includes(monthIndex) || false;
  };

  const getActivityColor = (activity: string) => {
    const activityObj = activities.find(a => a.name === activity);
    return activityObj?.color || "bg-gray-100 text-gray-800";
  };

  // Water requirement data for hybrid rice
  const hybridWaterRequirements = [
    {
      stage: "Land preparation & crop establishment",
      duration: "2–3 weeks",
      minimum: "100–120",
      optimal: "150–180",
      notes: "Needs more water for soaking & seedling establishment."
    },
    {
      stage: "Early vegetative (tillering)",
      duration: "3–4 weeks", 
      minimum: "80–100",
      optimal: "120–140",
      notes: "Vigorous growth, higher water uptake than inbred."
    },
    {
      stage: "Late vegetative → panicle initiation",
      duration: "3–4 weeks",
      minimum: "100–120",
      optimal: "140–160", 
      notes: "Needs steady water for panicle development."
    },
    {
      stage: "Reproductive (booting → flowering)",
      duration: "3 weeks",
      minimum: "120–150",
      optimal: "150–200",
      notes: "Very sensitive; drought at flowering can cause big yield losses."
    },
    {
      stage: "Grain filling → maturity",
      duration: "3–4 weeks",
      minimum: "80–100",
      optimal: "100–120",
      notes: "Water demand tapers off, but still higher than inbred."
    }
  ];

  // Water requirement data for inbred rice
  const inbredWaterRequirements = [
    {
      stage: "Land preparation & crop establishment",
      duration: "2–3 weeks",
      minimum: "80–100",
      optimal: "120–150",
      notes: "Needs standing water for land soaking & seedling growth."
    },
    {
      stage: "Early vegetative (tillering)",
      duration: "3–4 weeks",
      minimum: "70–90",
      optimal: "100–120",
      notes: "Moderate water demand; enough for tiller growth."
    },
    {
      stage: "Late vegetative → panicle initiation", 
      duration: "3–4 weeks",
      minimum: "90–110",
      optimal: "120–150",
      notes: "Water stress here reduces panicle number."
    },
    {
      stage: "Reproductive stage (booting → flowering)",
      duration: "3 weeks",
      minimum: "100–120",
      optimal: "150–200",
      notes: "Most critical stage; drought causes sterility."
    },
    {
      stage: "Grain filling → maturity",
      duration: "3–4 weeks",
      minimum: "70–90",
      optimal: "80–100",
      notes: "Needs less water but still continuous supply."
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Rice Cropping Calendar
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete guide to rice farming activities throughout the year, covering both wet and dry seasons
          </p>
        </div>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Legend</CardTitle>
            <CardDescription>Different colors represent different farming stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activities.map((activity) => (
                <Badge key={activity.name} className={activity.color} variant="secondary">
                  {activity.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wet Season Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-blue-600">
              Wet Season Cropping (March 16 – September 15)
            </CardTitle>
            <CardDescription>
              Main rice growing season with natural rainfall
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr>
                    <th className="border border-border p-2 md:p-3 bg-muted text-left min-w-[200px]">
                      Activity
                    </th>
                    {months.map((month) => (
                      <th key={month} className="border border-border p-2 md:p-3 bg-muted text-center min-w-[60px]">
                        {month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity.name}>
                      <td className="border border-border p-2 md:p-3 font-medium text-sm md:text-base">
                        {activity.name}
                      </td>
                      {months.map((month, monthIndex) => (
                        <td key={month} className="border border-border p-1 md:p-2 text-center">
                          {isActivityInMonth(activity.name, monthIndex, 'wet') && (
                            <div className={`w-full h-6 md:h-8 rounded ${getActivityColor(activity.name)} flex items-center justify-center`}>
                              <span className="text-xs md:text-sm font-medium">●</span>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Dry Season Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-amber-600">
              Dry Season Cropping (September 16 – March 15)
            </CardTitle>
            <CardDescription>
              Secondary rice growing season with irrigation support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr>
                    <th className="border border-border p-2 md:p-3 bg-muted text-left min-w-[200px]">
                      Activity
                    </th>
                    {months.map((month) => (
                      <th key={month} className="border border-border p-2 md:p-3 bg-muted text-center min-w-[60px]">
                        {month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity.name}>
                      <td className="border border-border p-2 md:p-3 font-medium text-sm md:text-base">
                        {activity.name}
                      </td>
                      {months.map((month, monthIndex) => (
                        <td key={month} className="border border-border p-1 md:p-2 text-center">
                          {isActivityInMonth(activity.name, monthIndex, 'dry') && (
                            <div className={`w-full h-6 md:h-8 rounded ${getActivityColor(activity.name)} flex items-center justify-center`}>
                              <span className="text-xs md:text-sm font-medium">●</span>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Water Requirements Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Monthly Water Requirements</CardTitle>
            <CardDescription>
              Rainfall requirements comparison between inbred and hybrid rice varieties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="comparison" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comparison">Side-by-Side Comparison</TabsTrigger>
                <TabsTrigger value="inbred">Inbred Rice</TabsTrigger>
                <TabsTrigger value="hybrid">Hybrid Rice</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr>
                        <th className="border border-border p-3 bg-muted text-left">Growth Stage</th>
                        <th className="border border-border p-3 bg-muted text-center">Duration</th>
                        <th className="border border-border p-3 bg-blue-50 text-center">Inbred Min (mm)</th>
                        <th className="border border-border p-3 bg-blue-50 text-center">Inbred Optimal (mm)</th>
                        <th className="border border-border p-3 bg-green-50 text-center">Hybrid Min (mm)</th>
                        <th className="border border-border p-3 bg-green-50 text-center">Hybrid Optimal (mm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inbredWaterRequirements.map((inbredReq, index) => {
                        const hybridReq = hybridWaterRequirements[index];
                        return (
                          <tr key={index}>
                            <td className="border border-border p-3 font-medium">{inbredReq.stage}</td>
                            <td className="border border-border p-3 text-center">{inbredReq.duration}</td>
                            <td className="border border-border p-3 text-center bg-blue-50">{inbredReq.minimum}</td>
                            <td className="border border-border p-3 text-center bg-blue-50">{inbredReq.optimal}</td>
                            <td className="border border-border p-3 text-center bg-green-50">{hybridReq.minimum}</td>
                            <td className="border border-border p-3 text-center bg-green-50">{hybridReq.optimal}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-600">Inbred Rice Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm"><strong>Survival:</strong> ~70–100 mm/month (minimum)</p>
                      <p className="text-sm"><strong>Optimal yield:</strong> ~120–150 mm/month (well-distributed)</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-600">Hybrid Rice Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm"><strong>Higher water demand:</strong> Generally 20-30% more than inbred</p>
                      <p className="text-sm"><strong>Better yield potential:</strong> When water requirements are met</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="inbred">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-600">Inbred Rice Water Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-border">
                        <thead>
                          <tr>
                            <th className="border border-border p-3 bg-muted text-left">Growth Stage</th>
                            <th className="border border-border p-3 bg-muted text-center">Duration</th>
                            <th className="border border-border p-3 bg-muted text-center">Minimum (mm)</th>
                            <th className="border border-border p-3 bg-muted text-center">Optimal (mm)</th>
                            <th className="border border-border p-3 bg-muted text-left">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inbredWaterRequirements.map((req, index) => (
                            <tr key={index}>
                              <td className="border border-border p-3 font-medium">{req.stage}</td>
                              <td className="border border-border p-3 text-center">{req.duration}</td>
                              <td className="border border-border p-3 text-center">{req.minimum}</td>
                              <td className="border border-border p-3 text-center">{req.optimal}</td>
                              <td className="border border-border p-3 text-sm">{req.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hybrid">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Hybrid Rice Water Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-border">
                        <thead>
                          <tr>
                            <th className="border border-border p-3 bg-muted text-left">Growth Stage</th>
                            <th className="border border-border p-3 bg-muted text-center">Duration</th>
                            <th className="border border-border p-3 bg-muted text-center">Minimum (mm)</th>
                            <th className="border border-border p-3 bg-muted text-center">Optimal (mm)</th>
                            <th className="border border-border p-3 bg-muted text-left">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hybridWaterRequirements.map((req, index) => (
                            <tr key={index}>
                              <td className="border border-border p-3 font-medium">{req.stage}</td>
                              <td className="border border-border p-3 text-center">{req.duration}</td>
                              <td className="border border-border p-3 text-center">{req.minimum}</td>
                              <td className="border border-border p-3 text-center">{req.optimal}</td>
                              <td className="border border-border p-3 text-sm">{req.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Season Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Wet Season Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Land Preparation:</strong> March 16 – April 15</p>
              <p><strong>Planting:</strong> April 1 – April 30</p>
              <p><strong>Growth:</strong> May – June</p>
              <p><strong>Flowering:</strong> July – early August</p>
              <p><strong>Harvest:</strong> Mid-August – September 15</p>
              <p><strong>Post-Harvest:</strong> September</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-amber-600">Dry Season Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Land Preparation:</strong> September 16 – October 15</p>
              <p><strong>Planting:</strong> October 1 – October 30</p>
              <p><strong>Growth:</strong> November – December</p>
              <p><strong>Flowering:</strong> January – early February</p>
              <p><strong>Harvest:</strong> Mid-February – March 15</p>
              <p><strong>Post-Harvest:</strong> March</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RiceCroppingCalendar;