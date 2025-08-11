import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import MapboxBayombong from "@/components/MapboxBayombong";

const MapPage = () => {
  useSEO({
    title: "SmartRice – Bayombong Map",
    description:
      "Interactive Mapbox map of Bayombong barangays with markers for each barangay.",
    canonicalPath: "/map",
  });

  return (
    <main className="container mx-auto py-10">
      <section>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Bayombong Map</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Tip: Enter your Mapbox public token below to load the interactive map. We’ll add
              Supabase Edge Function Secret support next so tokens aren’t needed on the client.
            </p>
            <MapboxBayombong />
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default MapPage;
