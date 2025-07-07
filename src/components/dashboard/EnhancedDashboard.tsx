
import React, { useState } from 'react';
import { KPICards } from './KPICards';
import { FinancialInsights } from './FinancialInsights';
import { PeriodFilter, PeriodOption } from './PeriodFilter';
import { FinancialCharts } from '@/components/analytics/FinancialCharts';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { GoalProgressCard } from './GoalProgressCard';
import { WelcomeCard } from './WelcomeCard';
import { SmartFinancialAlerts } from '@/components/alerts/SmartFinancialAlerts';
import { IncomingTransactions } from '@/components/transactions/IncomingTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function EnhancedDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('1month');
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  // Buscar dados do usuário e metas para os cards
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single();

      return {
        name: profile?.full_name,
        plan: subscription?.plan
      };
    },
    enabled: !!user
  });

  const { data: goalsData } = useQuery({
    queryKey: ['goals-progress', user?.id, workspace?.id],
    queryFn: async () => {
      if (!user) return { completedGoals: 0, totalGoals: 0, goalsProgress: 0 };

      const { data: goals } = await supabase
        .from('financial_goals')
        .select('target_amount, current_amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id);

      const totalGoals = goals?.length || 0;
      const completedGoals = goals?.filter(goal => 
        Number(goal.current_amount || 0) >= Number(goal.target_amount)
      ).length || 0;
      
      const goalsProgress = totalGoals === 0 ? 0 : (completedGoals / totalGoals) * 100;

      return { completedGoals, totalGoals, goalsProgress };
    },
    enabled: !!user && !!workspace
  });

  return (
    <div className="space-y-6">
      {/* Header com filtro de período */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
            Análises Financeiras
          </h1>
          <p className="text-muted-foreground">
            Visualize tendências e insights dos seus dados financeiros
          </p>
        </div>
        <PeriodFilter period={selectedPeriod} onPeriodChange={setSelectedPeriod} />
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Análises Avançadas */}
      <AdvancedAnalytics period={selectedPeriod} />

      {/* Layout principal com gráficos */}
      <div className="space-y-6">
        <FinancialCharts period={selectedPeriod} />
      </div>
    </div>
  );
}
