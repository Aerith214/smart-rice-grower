import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSEO } from "@/hooks/useSEO";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  
  useSEO({
    title: "SmartRice – Welcome",
    description:
      "This system helps farmers choose optimal planting and harvesting dates using rainfall data.",
    canonicalPath: "/",
  });

  return (
    <main className="min-h-[calc(100vh-64px)] grid place-items-center">
      <section className="container max-w-2xl">
        <Card className="shadow-sm">
          <CardHeader>
          <CardTitle>
            Welcome to SmartRice
          </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              This system aims to help farmers choose the best date to plant and harvest their crops
              according to existing rainfall data.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/map" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
                Map
              </Link>
              <Link to="/rainfall" className="rounded-md border px-4 py-2">
                Rainfall Data
              </Link>
              <Link to="/recommendation" className="rounded-md border px-4 py-2">
                Recommendation
              </Link>
              {user ? (
                <Link to="/admin" className="rounded-md border px-4 py-2">
                  Admin Panel
                </Link>
              ) : (
                <Link to="/auth" className="rounded-md border px-4 py-2">
                  Admin Login
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Index;
