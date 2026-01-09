import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Repeat
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  description?: string | null;
  date: string;
  is_recurring?: boolean;
}

interface TransactionInsightsProps {
  transactions: Transaction[];
}

export function TransactionInsights({ transactions }: TransactionInsightsProps) {
  const insights = useMemo(() => {
    if (transactions.length < 3) return [];

    const now = new Date();
    const currentMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));
    
    // Transações do mês atual e anterior
    const currentMonthTx = transactions.filter(t => 
      isSameMonth(parseISO(t.date), currentMonth)
    );
    const lastMonthTx = transactions.filter(t => 
      isSameMonth(parseISO(t.date), lastMonth)
    );

    // Cálculos
    const currentExpenses = currentMonthTx
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const lastExpenses = lastMonthTx
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const currentIncome = currentMonthTx
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const lastIncome = lastMonthTx
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Categoria mais gastadora do mês
    const expensesByCategory = new Map<string, number>();
    currentMonthTx
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = expensesByCategory.get(t.category) || 0;
        expensesByCategory.set(t.category, current + Number(t.amount));
      });
    
    const topCategory = Array.from(expensesByCategory.entries())
      .sort((a, b) => b[1] - a[1])[0];

    // Transações recorrentes
    const recurringTx = transactions.filter(t => t.is_recurring);
    const recurringTotal = recurringTx.reduce((sum, t) => {
      if (t.type === 'expense') return sum - Number(t.amount);
      return sum + Number(t.amount);
    }, 0);

    // Gerar insights
    const insightsList: Array<{
      icon: React.ReactNode;
      title: string;
      description: string;
      type: 'success' | 'warning' | 'info' | 'neutral';
    }> = [];

    // Comparação de gastos
    if (lastExpenses > 0) {
      const expenseChange = ((currentExpenses - lastExpenses) / lastExpenses) * 100;
      if (expenseChange > 20) {
        insightsList.push({
          icon: <ArrowUpRight className="w-4 h-4" />,
          title: 'Gastos aumentaram',
          description: `+${expenseChange.toFixed(0)}% em relação ao mês anterior`,
          type: 'warning'
        });
      } else if (expenseChange < -10) {
        insightsList.push({
          icon: <ArrowDownRight className="w-4 h-4" />,
          title: 'Gastos reduziram',
          description: `${expenseChange.toFixed(0)}% comparado ao mês anterior`,
          type: 'success'
        });
      }
    }

    // Comparação de receitas
    if (lastIncome > 0) {
      const incomeChange = ((currentIncome - lastIncome) / lastIncome) * 100;
      if (incomeChange > 10) {
        insightsList.push({
          icon: <TrendingUp className="w-4 h-4" />,
          title: 'Receitas cresceram',
          description: `+${incomeChange.toFixed(0)}% este mês. Continue assim!`,
          type: 'success'
        });
      } else if (incomeChange < -15) {
        insightsList.push({
          icon: <TrendingDown className="w-4 h-4" />,
          title: 'Receitas reduziram',
          description: `${incomeChange.toFixed(0)}% comparado ao mês passado`,
          type: 'warning'
        });
      }
    }

    // Top categoria
    if (topCategory && topCategory[1] > 0) {
      const percentage = currentExpenses > 0 
        ? ((topCategory[1] / currentExpenses) * 100).toFixed(0)
        : 0;
      insightsList.push({
        icon: <Target className="w-4 h-4" />,
        title: `${topCategory[0]} lidera gastos`,
        description: `${percentage}% das despesas (R$ ${topCategory[1].toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })})`,
        type: 'info'
      });
    }

    // Recorrentes
    if (recurringTx.length > 0) {
      insightsList.push({
        icon: <Repeat className="w-4 h-4" />,
        title: `${recurringTx.length} transações recorrentes`,
        description: `Impacto mensal: R$ ${Math.abs(recurringTotal).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
        type: 'neutral'
      });
    }

    // Taxa de economia
    if (currentIncome > 0) {
      const savingsRate = ((currentIncome - currentExpenses) / currentIncome) * 100;
      if (savingsRate > 20) {
        insightsList.push({
          icon: <Lightbulb className="w-4 h-4" />,
          title: 'Excelente taxa de economia',
          description: `Você está guardando ${savingsRate.toFixed(0)}% da sua renda`,
          type: 'success'
        });
      } else if (savingsRate < 0) {
        insightsList.push({
          icon: <AlertTriangle className="w-4 h-4" />,
          title: 'Gastos excedem receitas',
          description: `Revise seu orçamento para equilibrar as contas`,
          type: 'warning'
        });
      }
    }

    return insightsList.slice(0, 4);
  }, [transactions]);

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
