import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsAdmin() {
  const { user } = useAuth();

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .rpc('is_admin', { _user_id: user.id });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data || false;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return { isAdmin, isLoading };
}
