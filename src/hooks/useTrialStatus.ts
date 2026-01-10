import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TrialStatus {
  isOnTrial: boolean;
  trialStartDate: string | null;
  trialEndDate: string | null;
  trialDaysRemaining: number;
  canStartTrial: boolean;
}

export function useTrialStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: trialStatus, isLoading } = useQuery({
    queryKey: ['trial-status', user?.id],
    queryFn: async (): Promise<TrialStatus> => {
      if (!user) throw new Error('User not authenticated');

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('is_trial, trial_start_date, trial_end_date, plan')
        .eq('user_id', user.id)
        .single();

      if (!subscription) {
        return {
          isOnTrial: false,
          trialStartDate: null,
          trialEndDate: null,
          trialDaysRemaining: 0,
          canStartTrial: true
        };
      }

      const isOnTrial = subscription.is_trial === true;
      const trialEndDate = subscription.trial_end_date;
      
      let trialDaysRemaining = 0;
      if (isOnTrial && trialEndDate) {
        const endDate = new Date(trialEndDate);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        trialDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      // Pode iniciar trial se nunca teve trial
      const canStartTrial = !subscription.trial_start_date && subscription.plan === 'free';

      return {
        isOnTrial,
        trialStartDate: subscription.trial_start_date,
        trialEndDate,
        trialDaysRemaining,
        canStartTrial
      };
    },
    enabled: !!user
  });

  const startTrialMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('start_pro_trial', {
        p_user_id: user.id
      });

      if (error) throw error;
      return data as boolean;
    },
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['trial-status'] });
        queryClient.invalidateQueries({ queryKey: ['subscription-limits'] });
        queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      }
    }
  });

  return {
    isOnTrial: trialStatus?.isOnTrial ?? false,
    trialStartDate: trialStatus?.trialStartDate ?? null,
    trialEndDate: trialStatus?.trialEndDate ?? null,
    trialDaysRemaining: trialStatus?.trialDaysRemaining ?? 0,
    canStartTrial: trialStatus?.canStartTrial ?? false,
    isLoading,
    startTrial: startTrialMutation.mutateAsync,
    isStartingTrial: startTrialMutation.isPending
  };
}