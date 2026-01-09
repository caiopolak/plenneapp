import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, PiggyBank, Target } from 'lucide-react';

interface Budget {
  id: string;
  category: string;
  amount_limit: number;
  spent: number;
  remaining: number;
  percentage: number;
}

interface BudgetInsightsProps {
  budgets: Budget[];
}

export function BudgetInsights({ budgets }: BudgetInsightsProps) {
  const insights = useMemo(() => {
    if (budgets.length === 0) return [];

    const result: { icon: React.ElementType; title: string; description: string; type: 'success' | 'warning' | 'info' | 'neutral' }[] = [];

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount_limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Orçamentos estourados
    const exceededBudgets = budgets.filter(b => b.percentage >= 100);
    if (exceededBudgets.length > 0) {
      result.push({
        icon: AlertTriangle,
        title: `${exceededBudgets.length} orçamento${exceededBudgets.length > 1 ? 's' : ''} estourado${exceededBudgets.length > 1 ? 's' : ''}`,
        description: exceededBudgets.map(b => b.category).join(', '),
        type: 'warning',
      });
    }

    // Orçamentos em alerta (80-99%)
    const warningBudgets = budgets.filter(b => b.percentage >= 80 && b.percentage < 100);
    if (warningBudgets.length > 0) {
      result.push({
        icon: TrendingUp,
        title: `${warningBudgets.length} próximo${warningBudgets.length > 1 ? 's' : ''} do limite`,
        description: `Atenção com: ${warningBudgets.map(b => b.category).slice(0, 2).join(', ')}`,
        type: 'info',
      });
    }

    // Orçamentos sob controle
    const controlledBudgets = budgets.filter(b => b.percentage < 50 && b.spent > 0);
    if (controlledBudgets.length >= 2) {
      result.push({
        icon: CheckCircle2,
        title: `${controlledBudgets.length} categorias sob controle`,
        description: 'Excelente gestão de gastos nestas categorias!',
        type: 'success',
      });
    }

    // Economia total
    const totalRemaining = totalBudget - totalSpent;
    if (totalRemaining > 0 && totalSpent > 0) {
      result.push({
        icon: PiggyBank,
        title: `R$ ${totalRemaining.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} disponível`,
        description: `Você usou ${totalPercentage.toFixed(0)}% do orçamento total.`,
        type: totalPercentage < 80 ? 'success' : 'neutral',
      });
    }

    // Categoria mais gastadora
    const topSpender = budgets.reduce((max, b) => b.spent > max.spent ? b : max, budgets[0]);
    if (topSpender && topSpender.spent > 0) {
      const spentPercentOfTotal = (topSpender.spent / totalSpent) * 100;
      if (spentPercentOfTotal > 30) {
        result.push({
          icon: Target,
          title: `${topSpender.category} lidera gastos`,
          description: `${spentPercentOfTotal.toFixed(0)}% do total gasto está nessa categoria.`,
          type: 'neutral',
        });
      }
    }

    return result.slice(0, 4);
  }, [budgets]);

  if (insights.length === 0) return null;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
      case 'info':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {insights.map((insight, index) => {
        const Icon = insight.icon;
        return (
          <Card
            key={index}
            className={`border transition-all duration-200 hover:scale-[1.02] ${getTypeStyles(insight.type)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background/50">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{insight.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
