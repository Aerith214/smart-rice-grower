import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, Eye, Check, X, Trash2, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  full_name: string | null;
  contact_number: string | null;
  farm_name: string | null;
  farm_location: string | null;
  role: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const UserManagement = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, statusFilter]);

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

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.username?.toLowerCase().includes(query) ||
        u.full_name?.toLowerCase().includes(query) ||
        u.farm_name?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const updateUserStatus = async (userId: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${newStatus} user`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">Pending</Badge>;
    }
  };

  const getRoleBadge = (role: string | null) => {
    if (role === 'admin') {
      return <Badge variant="default">Admin</Badge>;
    }
    return <Badge variant="outline">User</Badge>;
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

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, username, or farm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-yellow-600">{users.filter(u => u.status === 'pending').length}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'approved').length}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold text-red-600">{users.filter(u => u.status === 'rejected').length}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.username}</TableCell>
                      <TableCell>{profile.full_name || '-'}</TableCell>
                      <TableCell>{getRoleBadge(profile.role)}</TableCell>
                      <TableCell>{getStatusBadge(profile.status)}</TableCell>
                      <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {profile.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => updateUserStatus(profile.user_id, 'approved')}
                                disabled={actionLoading === profile.user_id}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => updateUserStatus(profile.user_id, 'rejected')}
                                disabled={actionLoading === profile.user_id}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {profile.status === 'rejected' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => updateUserStatus(profile.user_id, 'approved')}
                              disabled={actionLoading === profile.user_id}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {profile.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => updateUserStatus(profile.user_id, 'rejected')}
                              disabled={actionLoading === profile.user_id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                disabled={actionLoading === profile.user_id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this user? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(profile.user_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default UserManagement;
