
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { safeLog } from '@/lib/security';

export interface PlanLimits {
  transactions: number;
  goals: number;
  investments: number;
  workspaces: number;
  plan: string;
}

export function useSubscriptionLimits() {
  const { user } = useAuth();

  const { data: limits, isLoading } = useQuery({
    queryKey: ['subscription-limits', user?.id],
    queryFn: async (): Promise<PlanLimits> => {
      if (!user) throw new Error('User not authenticated');

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single();

      const plan = subscription?.plan || 'free';

      // Definir limites baseado no plano
      const planLimits: Record<string, PlanLimits> = {
        free: {
          transactions: 50,
          goals: 3,
          investments: 5,
          workspaces: 1,
          plan: 'free'
        },
        pro: {
          transactions: 500,
          goals: 15,
          investments: 25,
          workspaces: 3,
          plan: 'pro'
        },
        business: {
          transactions: -1, // Ilimitado
          goals: -1,
          investments: -1,
          workspaces: 10,
          plan: 'business'
        }
      };

      return planLimits[plan] || planLimits.free;
    },
    enabled: !!user
  });

  const checkLimit = async (resourceType: keyof Omit<PlanLimits, 'plan'>) => {
    if (!user || !limits) return false;

    try {
      const { data: canProceed } = await supabase.rpc('check_plan_limits', {
        user_uuid: user.id,
        resource_type: resourceType
      });

      if (!canProceed) {
        const limit = limits[resourceType];
        const limitText = limit === -1 ? 'ilimitado' : limit.toString();
        
        toast.error(
          `Limite do plano ${limits.plan} atingido!`,
          {
            description: `Você pode criar até ${limitText} ${resourceType} por mês. Faça upgrade da sua assinatura.`
          }
        );
      }

      return canProceed;
    } catch (error) {
      safeLog('error', 'Error checking limits', { error: String(error) });
      return true; // Em caso de erro, permitir a ação
    }
  };

  return {
    limits,
    isLoading,
    checkLimit
  };
}
