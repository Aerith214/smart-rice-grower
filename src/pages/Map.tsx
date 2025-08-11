import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import OsmBayombong from "@/components/OsmBayombong";

const MapPage = () => {
  useSEO({
    title: "SmartRice – Bayombong Map",
      description: "Interactive OpenStreetMap map of Bayombong barangays with markers.",
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
              This interactive map uses OpenStreetMap data and requires no API token.
            </p>
            <OsmBayombong />
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default MapPage;
