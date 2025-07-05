import React, { useState } from 'react';
import { WelcomeCard } from './WelcomeCard';
import { KPICards } from './KPICards';
import { UnifiedSmartAlerts } from '@/components/alerts/UnifiedSmartAlerts';
import { IncomingTransactions } from '@/components/transactions/IncomingTransactions';

import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function DashboardMain() {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
            Dashboard Financeiro
          </h1>
          <p className="text-muted-foreground">
            Acompanhe sua situação financeira em tempo real
          </p>
        </div>
        <Button 
          onClick={() => setShowTransactionForm(true)}
          className="bg-[#2f9e44] hover:bg-[#2f9e44]/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Welcome Card */}
      <WelcomeCard 
        name={userProfile?.name}
        plan={userProfile?.plan}
      />

      {/* KPI Cards */}
      <KPICards />

      {/* Layout principal */}
      <div className="space-y-6">
        <UnifiedSmartAlerts />
        <IncomingTransactions />
      </div>

      {/* Modal de Nova Transação */}
      <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
        <DialogContent className="max-w-xl w-full rounded-2xl p-4 md:p-6">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSuccess={() => setShowTransactionForm(false)}
            onCancel={() => setShowTransactionForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}