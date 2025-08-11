import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import mapImage from "@/assets/bayombong-map.png";
import { useSEO } from "@/hooks/useSEO";

const MapPage = () => {
  useSEO({
    title: "SmartRice – Bayombong Map",
    description:
      "Simplified map of Bayombong barangays. Future updates will enable barangay-specific data.",
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
            <img
              src={mapImage}
              alt="Bayombong barangay boundaries map"
              loading="lazy"
              className="w-full h-auto rounded-md"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Tip: Barangay clicks and details are coming soon.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default MapPage;
