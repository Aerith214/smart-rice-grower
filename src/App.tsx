import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Header from "@/components/Header";
import MapPage from "@/pages/Map";
import RainfallPage from "@/pages/Rainfall";
import RecommendationPage from "@/pages/Recommendation";
import RiceCroppingCalendar from "@/pages/RiceCroppingCalendar";
import AdminPage from "@/pages/Admin";
import AuthPage from "@/pages/Auth";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="dark">
            <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/rainfall" element={<RainfallPage />} />
            <Route path="/recommendation" element={<RecommendationPage />} />
            <Route path="/cropping-calendar" element={<RiceCroppingCalendar />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/auth" element={<AuthPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
