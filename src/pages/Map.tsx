import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import TyphoonMap from "@/components/TyphoonMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OsmBayombong from "@/components/OsmBayombong";

const MapPage = () => {
  useSEO({
    title: "SmartRice – Typhoon Tracker & Map",
    description: "Interactive map showing active tropical cyclones, typhoon tracks, forecasts, and Bayombong barangays.",
    canonicalPath: "/map",
  });

  return (
    <main className="container mx-auto py-10">
      <section>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Interactive Map & Typhoon Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="typhoon" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="typhoon">Typhoon Tracker</TabsTrigger>
                <TabsTrigger value="barangay">Barangay Map</TabsTrigger>
              </TabsList>
              <TabsContent value="typhoon" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Real-time tracking of active tropical cyclones with historical tracks and forecast paths.
                </p>
                <TyphoonMap />
              </TabsContent>
              <TabsContent value="barangay" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Interactive map of Bayombong barangays using OpenStreetMap data.
                </p>
                <OsmBayombong />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default MapPage;
