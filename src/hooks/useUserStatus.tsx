import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

type UserStatus = 'pending' | 'approved' | 'rejected' | null;

export const useUserStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<UserStatus>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!user) {
        setStatus(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user status:', error);
          setStatus(null);
        } else {
          setStatus(data?.status as UserStatus || null);
        }
      } catch (error) {
        console.error('Error in fetchUserStatus:', error);
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatus();
  }, [user]);

  return {
    status,
    loading,
    isPending: status === 'pending',
    isApproved: status === 'approved',
    isRejected: status === 'rejected',
  };
};
