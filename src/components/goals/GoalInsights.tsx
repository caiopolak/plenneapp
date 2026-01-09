import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number | null;
  target_date: string | null;
  created_at: string | null;
  priority: string | null;
}

interface GoalInsightsProps {
  goals: Goal[];
}

export function GoalInsights({ goals }: GoalInsightsProps) {
  const insights = useMemo(() => {
    if (goals.length < 1) return [];

    const insightsList: Array<{
      icon: React.ReactNode;
      title: string;
      description: string;
      type: 'success' | 'warning' | 'info' | 'neutral';
    }> = [];

    // Calcular estatísticas
    const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalCurrent = goals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    
    const completedGoals = goals.filter(g => {
      const progress = g.target_amount > 0 ? ((g.current_amount || 0) / g.target_amount) * 100 : 0;
      return progress >= 100;
    });

    const activeGoals = goals.filter(g => {
      const progress = g.target_amount > 0 ? ((g.current_amount || 0) / g.target_amount) * 100 : 0;
      return progress < 100;
    });

    // Metas próximas do prazo
    const urgentGoals = activeGoals.filter(g => {
      if (!g.target_date) return false;
      const daysRemaining = differenceInDays(parseISO(g.target_date), new Date());
      return daysRemaining >= 0 && daysRemaining <= 30;
    });

    // Metas atrasadas
    const overdueGoals = activeGoals.filter(g => {
      if (!g.target_date) return false;
      const daysRemaining = differenceInDays(parseISO(g.target_date), new Date());
      return daysRemaining < 0;
    });

    // Taxa de economia média mensal
    const avgMonthlyRate = goals.reduce((sum, g) => {
      const current = g.current_amount || 0;
      const createdAt = g.created_at ? parseISO(g.created_at) : new Date();
      const days = Math.max(1, differenceInDays(new Date(), createdAt));
      return sum + (current / days) * 30;
    }, 0) / Math.max(1, goals.length);

    // Progresso geral
    if (overallProgress >= 50) {
      insightsList.push({
        icon: <TrendingUp className="w-4 h-4" />,
        title: `${overallProgress.toFixed(0)}% do total alcançado`,
        description: `R$ ${totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} de R$ ${totalTarget.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
        type: 'success'
      });
    } else if (overallProgress > 0) {
      insightsList.push({
        icon: <Target className="w-4 h-4" />,
        title: `${overallProgress.toFixed(0)}% do caminho percorrido`,
        description: `Faltam R$ ${(totalTarget - totalCurrent).toLocaleString('pt-BR', { minimumFractionDigits: 0 })} para todas as metas`,
        type: 'info'
      });
    }

    // Metas concluídas
    if (completedGoals.length > 0) {
      insightsList.push({
        icon: <CheckCircle2 className="w-4 h-4" />,
        title: `${completedGoals.length} meta${completedGoals.length > 1 ? 's' : ''} concluída${completedGoals.length > 1 ? 's' : ''}`,
        description: 'Parabéns pelas conquistas! 🎉',
        type: 'success'
      });
    }

    // Metas urgentes
    if (urgentGoals.length > 0) {
      insightsList.push({
        icon: <Clock className="w-4 h-4" />,
        title: `${urgentGoals.length} meta${urgentGoals.length > 1 ? 's' : ''} próxima${urgentGoals.length > 1 ? 's' : ''} do prazo`,
        description: 'Atenção aos próximos 30 dias',
        type: 'warning'
      });
    }

    // Metas atrasadas
    if (overdueGoals.length > 0) {
      insightsList.push({
        icon: <AlertTriangle className="w-4 h-4" />,
        title: `${overdueGoals.length} meta${overdueGoals.length > 1 ? 's' : ''} com prazo vencido`,
        description: 'Considere revisar os prazos',
        type: 'warning'
      });
    }

    // Ritmo de economia
    if (avgMonthlyRate > 0) {
      insightsList.push({
        icon: <Zap className="w-4 h-4" />,
        title: 'Ritmo médio de aportes',
        description: `R$ ${avgMonthlyRate.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mês`,
        type: 'neutral'
      });
    }

    // Próxima meta a ser concluída
    const nearestToComplete = activeGoals
      .map(g => ({
        goal: g,
        remaining: g.target_amount - (g.current_amount || 0),
        progress: g.target_amount > 0 ? ((g.current_amount || 0) / g.target_amount) * 100 : 0
      }))
      .filter(g => g.progress >= 75 && g.progress < 100)
      .sort((a, b) => b.progress - a.progress)[0];

    if (nearestToComplete) {
      insightsList.push({
        icon: <Sparkles className="w-4 h-4" />,
        title: `"${nearestToComplete.goal.name}" quase lá!`,
        description: `${nearestToComplete.progress.toFixed(0)}% - Faltam R$ ${nearestToComplete.remaining.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
        type: 'success'
      });
    }

    return insightsList.slice(0, 4);
  }, [goals]);

  if (insights.length === 0) return null;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'info':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {insights.map((insight, index) => (
        <Card 
          key={index} 
          className={`border ${getTypeStyles(insight.type)} transition-all hover:scale-[1.02]`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getTypeStyles(insight.type)}`}>
                {insight.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground truncate">
                  {insight.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {insight.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
