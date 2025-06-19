
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Target, Calendar, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  type: 'budget_exceeded' | 'goal_deadline' | 'income_drop' | 'recurring_due' | 'investment_opportunity';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  data?: any;
  created_at: string;
}

export function SmartFinancialAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();
  const { toast } = useToast();

  const generateSmartAlerts = async () => {
    if (!user || !workspace?.id) return;

    const newAlerts: Alert[] = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    try {
      // 1. Verificar orçamentos excedidos
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('year', currentYear)
        .eq('month', currentMonth);

      const { data: expenses } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('workspace_id', workspace.id)
        .eq('type', 'expense')
        .gte('date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      const expensesByCategory = expenses?.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
        return acc;
      }, {} as Record<string, number>) || {};

      budgets?.forEach(budget => {
        const spent = expensesByCategory[budget.category] || 0;
        const percentage = (spent / budget.amount_limit) * 100;
        
        if (percentage > 100) {
          newAlerts.push({
            id: `budget-exceeded-${budget.id}`,
            type: 'budget_exceeded',
            title: 'Orçamento Excedido',
            message: `Você excedeu o orçamento de ${budget.category} em ${(percentage - 100).toFixed(1)}%`,
            priority: 'high',
            data: { category: budget.category, percentage },
            created_at: new Date().toISOString()
          });
        } else if (percentage > 80) {
          newAlerts.push({
            id: `budget-warning-${budget.id}`,
            type: 'budget_exceeded',
            title: 'Orçamento Próximo do Limite',
            message: `Você já gastou ${percentage.toFixed(1)}% do orçamento de ${budget.category}`,
            priority: 'medium',
            data: { category: budget.category, percentage },
            created_at: new Date().toISOString()
          });
        }
      });

      // 2. Verificar metas com prazo próximo
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('workspace_id', workspace.id)
        .not('target_date', 'is', null);

      goals?.forEach(goal => {
        const targetDate = new Date(goal.target_date);
        const daysUntilTarget = Math.ceil((targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;

        if (daysUntilTarget <= 30 && daysUntilTarget > 0 && progress < 80) {
          newAlerts.push({
            id: `goal-deadline-${goal.id}`,
            type: 'goal_deadline',
            title: 'Meta com Prazo Próximo',
            message: `A meta "${goal.name}" vence em ${daysUntilTarget} dias e está ${progress.toFixed(1)}% completa`,
            priority: 'medium',
            data: { goalName: goal.name, daysUntilTarget, progress },
            created_at: new Date().toISOString()
          });
        }
      });

      // 3. Verificar transações recorrentes pendentes
      const { data: recurringTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('is_recurring', true);

      // 4. Verificar queda na receita (comparar últimos 2 meses)
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const { data: currentMonthIncome } = await supabase
        .from('transactions')
        .select('amount')
        .eq('workspace_id', workspace.id)
        .eq('type', 'income')
        .gte('date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      const { data: lastMonthIncome } = await supabase
        .from('transactions')
        .select('amount')
        .eq('workspace_id', workspace.id)
        .eq('type', 'income')
        .gte('date', `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-01`)
        .lt('date', `${lastMonthYear}-${(lastMonth + 1).toString().padStart(2, '0')}-01`);

      const currentTotal = currentMonthIncome?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const lastTotal = lastMonthIncome?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      if (lastTotal > 0 && currentTotal < lastTotal * 0.8) {
        const decrease = ((lastTotal - currentTotal) / lastTotal) * 100;
        newAlerts.push({
          id: 'income-drop',
          type: 'income_drop',
          title: 'Queda na Receita',
          message: `Sua receita este mês está ${decrease.toFixed(1)}% menor que o mês passado`,
          priority: 'high',
          data: { decrease, currentTotal, lastTotal },
          created_at: new Date().toISOString()
        });
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Erro ao gerar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateSmartAlerts();
  }, [user, workspace]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <TrendingDown className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) return <div>Carregando alertas...</div>;

  return (
    <Card className="bg-white border-[--primary]/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[--primary] font-display">
          <Bell className="w-5 h-5" />
          Alertas Inteligentes ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Nenhum alerta no momento</p>
            <p className="text-sm">Suas finanças estão em ordem!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-[#eaf6ee]"
              >
                <div className="mt-1">
                  {getPriorityIcon(alert.priority)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{alert.title}</h4>
                    <Badge variant={getPriorityColor(alert.priority) as any}>
                      {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
