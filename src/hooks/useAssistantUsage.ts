import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AssistantUsage {
  currentCount: number;
  maxCount: number;
  remaining: number;
  canAsk: boolean;
  plan: string;
}

export function useAssistantUsage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: usage, isLoading } = useQuery({
    queryKey: ['assistant-usage', user?.id],
    queryFn: async (): Promise<AssistantUsage> => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_assistant_usage', {
        p_user_id: user.id
      });

      if (error) throw error;

      const result = data as {
        current_count: number;
        max_count: number;
        remaining: number;
        can_ask: boolean;
        plan: string;
      };

      return {
        currentCount: result.current_count,
        maxCount: result.max_count,
        remaining: result.remaining,
        canAsk: result.can_ask,
        plan: result.plan
      };
    },
    enabled: !!user
  });

  const incrementMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('increment_assistant_usage', {
        p_user_id: user.id
      });

      if (error) throw error;

      const result = data as {
        current_count: number;
        max_count: number;
        can_ask: boolean;
        plan: string;
      };

      return {
        currentCount: result.current_count,
        maxCount: result.max_count,
        canAsk: result.can_ask,
        plan: result.plan
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant-usage'] });
    }
  });

  return {
    usage: usage ?? {
      currentCount: 0,
      maxCount: 5,
      remaining: 5,
      canAsk: true,
      plan: 'free'
    },
    isLoading,
    incrementUsage: incrementMutation.mutateAsync,
    isIncrementing: incrementMutation.isPending
  };
}