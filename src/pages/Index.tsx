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
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
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
      <section className="py-24 bg-gradient-to-b from-background to-accent/5">
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
                <CardTitle className="text-xl">Rainfall Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-center">
                  Real-time precipitation data and historical rainfall patterns to inform your farming decisions with precision.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-border/40 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Geographic Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-center">
                  Interactive maps of Bayombong showing topographical data and farming zones for better planning.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-border/40 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Data Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-center">
                  Advanced charts and visualizations to track trends and make informed predictions about crop yields.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group border-border/40 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Planting Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-center">
                  Optimized planting and harvesting schedules based on weather patterns and crop cycles for maximum yield.
                </CardDescription>
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
