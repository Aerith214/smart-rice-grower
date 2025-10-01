import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  contact_number: string;
  farm_name: string;
  farm_location: string;
  role: string;
  created_at: string;
}

const UserManagement = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useSEO({
    title: "User Management - SmartRice",
    description: "Manage user profiles and access.",
    canonicalPath: "/user-management",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin-auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch user profiles",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const viewUserProfile = (userId: string) => {
    // In a real app, you would navigate to a detailed user profile page
    // For now, we'll just show a toast
    toast({
      title: "User Profile",
      description: `Viewing profile for user ID: ${userId}`,
    });
  };

  if (loading || loadingUsers) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="text-center">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Users className="h-8 w-8" />
          User Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all registered users in the SmartRice system.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12">
              <p className="text-muted-foreground text-center">
                No users found in the system.
              </p>
            </CardContent>
          </Card>
        ) : (
          users.map((profile) => (
            <Card key={profile.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{profile.username}</CardTitle>
                    {profile.full_name && (
                      <CardDescription>{profile.full_name}</CardDescription>
                    )}
                  </div>
                  <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                    {profile.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.farm_name && (
                  <div className="text-sm">
                    <span className="font-medium">Farm:</span> {profile.farm_name}
                  </div>
                )}
                {profile.farm_location && (
                  <div className="text-sm">
                    <span className="font-medium">Location:</span> {profile.farm_location}
                  </div>
                )}
                {profile.contact_number && (
                  <div className="text-sm">
                    <span className="font-medium">Contact:</span> {profile.contact_number}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Joined: {new Date(profile.created_at).toLocaleDateString()}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => viewUserProfile(profile.user_id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
};

export default UserManagement;
