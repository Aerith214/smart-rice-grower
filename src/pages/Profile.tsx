import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  created_at: string;
}

interface HarvestStats {
  totalHarvests: number;
  totalCrops: number;
  averageTimingDifference: number;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [harvestStats, setHarvestStats] = useState<HarvestStats>({
    totalHarvests: 0,
    totalCrops: 0,
    averageTimingDifference: 0
  });
  const [formData, setFormData] = useState({
    username: "",
    fullName: ""
  });

  useSEO({
    title: "User Profile - SmartRice",
    description: "Manage your farming profile and view harvest statistics.",
    canonicalPath: "/profile",
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchHarvestStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setFormData({
          username: data.username || "",
          fullName: data.full_name || ""
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch profile",
        variant: "destructive",
      });
    }
  };

  const fetchHarvestStats = async () => {
    try {
      const { data: harvestLogs, error } = await supabase
        .from('harvest_logs')
        .select('crop_type, actual_harvest_date, recommended_harvest_date')
        .eq('user_id', user?.id);

      if (error) throw error;

      const logs = harvestLogs || [];
      const uniqueCrops = new Set(logs.map(log => log.crop_type)).size;
      
      const logsWithRecommendations = logs.filter(log => log.recommended_harvest_date);
      const averageTimingDifference = logsWithRecommendations.length > 0 
        ? logsWithRecommendations.reduce((sum, log) => {
            const actualDate = new Date(log.actual_harvest_date);
            const recommendedDate = new Date(log.recommended_harvest_date);
            const diff = Math.abs((actualDate.getTime() - recommendedDate.getTime()) / (1000 * 60 * 60 * 24));
            return sum + diff;
          }, 0) / logsWithRecommendations.length
        : 0;

      setHarvestStats({
        totalHarvests: logs.length,
        totalCrops: uniqueCrops,
        averageTimingDifference: Math.round(averageTimingDifference)
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch harvest statistics",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          username: formData.username,
          full_name: formData.fullName,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">User Profile</h1>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">User Profile</h1>
        <p className="text-muted-foreground">
          Manage your farming profile and view your harvest statistics.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and farming details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here. Contact support if needed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </form>

            {profile && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  Member since: {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Harvest Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Harvest Statistics
            </CardTitle>
            <CardDescription>
              Overview of your farming activities and harvest performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {harvestStats.totalHarvests}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Harvests</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {harvestStats.totalCrops}
                  </div>
                  <div className="text-sm text-muted-foreground">Crop Types</div>
                </div>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {harvestStats.averageTimingDifference} days
                </div>
                <div className="text-sm text-muted-foreground">
                  Average Timing Difference from Recommendations
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Quick Actions</h4>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/harvest-logger')}
                    className="justify-start"
                  >
                    Record New Harvest
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/harvest-comparison')}
                    className="justify-start"
                  >
                    View Harvest Analysis
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/smart-system')}
                    className="justify-start"
                  >
                    Check Recommendations
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Profile;