
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

      // Definir limites baseado no plano (sincronizado com SubscriptionPlans.tsx)
      const planLimits: Record<string, PlanLimits> = {
        free: {
          transactions: 100,    // 100 transações/mês
          goals: 3,             // 3 metas
          investments: 5,       // 5 investimentos
          workspaces: 1,        // 1 workspace pessoal
          plan: 'free'
        },
        pro: {
          transactions: 500,    // 500 transações/mês
          goals: 15,            // 15 metas
          investments: 25,      // 25 investimentos
          workspaces: 3,        // 3 workspaces
          plan: 'pro'
        },
        business: {
          transactions: -1,     // Ilimitado
          goals: -1,            // Ilimitado
          investments: -1,      // Ilimitado
          workspaces: 10,       // 10 workspaces
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
