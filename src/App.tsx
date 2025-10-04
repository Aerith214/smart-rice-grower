import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Header from "@/components/Header";
import MapPage from "@/pages/Map";
import RainfallPage from "@/pages/Rainfall";
import RecommendationPage from "@/pages/Recommendation";
import RiceCroppingCalendar from "@/pages/RiceCroppingCalendar";
import SmartCroppingSystem from "@/pages/SmartCroppingSystem";
import AdminPage from "@/pages/Admin";
import AdminAuth from "@/pages/AdminAuth";
import UserAuth from "@/pages/UserAuth";
import HarvestLogger from "@/pages/HarvestLogger";
import HarvestComparison from "@/pages/HarvestComparison";
import Profile from "@/pages/Profile";
import TyphoonTracker from "@/pages/TyphoonTracker";
import UserManagement from "@/pages/UserManagement";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

// Protected Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useUserRole();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

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
            <Route path="/smart-system" element={<SmartCroppingSystem />} />
            <Route path="/harvest-logger" element={<HarvestLogger />} />
            <Route path="/harvest-comparison" element={<HarvestComparison />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/typhoon-tracker" element={<TyphoonTracker />} />
            <Route path="/user-management" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="/user-auth" element={<UserAuth />} />
            <Route path="/admin-auth" element={<AdminAuth />} />
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
