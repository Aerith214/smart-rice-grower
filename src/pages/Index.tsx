import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/hooks/useAuth";
import { Cloud, MapPin, TrendingUp, Calendar, Droplets, Sprout, BarChart3 } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  
  useSEO({
    title: "SmartRice – Smart Rice Farming Platform",
    description: "Precision rice farming through data-driven insights, rainfall monitoring, and intelligent planting recommendations for Bayombong farmers.",
    canonicalPath: "/",
  });

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-background py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              <Sprout className="w-4 h-4 mr-2" />
              Smart Agriculture Technology
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent leading-tight">
            SmartRice
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing rice farming through data-driven insights, real-time rainfall monitoring, and intelligent planting recommendations for Bayombong farmers.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="group">
              <Link to="/rainfall">
                <BarChart3 className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                View Rainfall Analytics
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="group">
              <Link to="/map">
                <MapPin className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Explore Interactive Map
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Advanced Agricultural Intelligence
            </h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Harness the power of data science and meteorological insights to optimize your rice farming operations with precision and efficiency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group border-border/40 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Droplets className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Rainfall Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-center">
                  Track daily, monthly, and yearly rainfall data with interactive charts. View historical patterns from 2015 onwards to make data-driven decisions about irrigation and planting schedules.
                </CardDescription>
                <div className="mt-4 text-center">
                  <Button asChild variant="link" size="sm">
                    <Link to="/rainfall">View Analytics →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-border/40 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Interactive Map</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-center">
                  Explore Bayombong with detailed geographic maps showing topography, farm locations, and weather zones. Useful for planning field layouts and understanding local climate variations.
                </CardDescription>
                <div className="mt-4 text-center">
                  <Button asChild variant="link" size="sm">
                    <Link to="/map">Open Map →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-border/40 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Planting Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-center">
                  Get AI-generated planting and harvesting schedules based on historical rainfall data. The system automatically suggests optimal dates for both inbred and hybrid rice varieties.
                </CardDescription>
                <div className="mt-4 text-center">
                  <Button asChild variant="link" size="sm">
                    <Link to="/recommendation">View Calendar →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-border/40 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Harvest Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-center">
                  Log your actual harvest dates and compare them with system recommendations. Track crop performance over time and identify patterns to improve future yields.
                </CardDescription>
                <div className="mt-4 text-center">
                  <Button asChild variant="link" size="sm">
                    <Link to="/harvest-logger">Log Harvest →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold mb-8">Quick Access</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline">
                <Link to="/recommendation">
                  <Calendar className="mr-2 h-4 w-4" />
                  Planting Recommendations
                </Link>
              </Button>
              {user ? (
                <Button asChild variant="outline">
                  <Link to="/admin">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/auth">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Admin Login
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
