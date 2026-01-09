import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Calendar, Target, Zap, Award, Clock } from "lucide-react";
import { differenceInDays, differenceInMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GoalStatisticsProps {
  goalId: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  createdAt?: string | null;
}

interface DepositData {
  amount: number;
  created_at: string;
}

export function GoalStatistics({ 
  goalId, 
  targetAmount, 
  currentAmount, 
  targetDate,
  createdAt 
}: GoalStatisticsProps) {
  const [deposits, setDeposits] = useState<DepositData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposits = async () => {
      const { data } = await supabase
        .from('goal_deposits')
        .select('amount, created_at')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: true });
      
      if (data) setDeposits(data);
      setLoading(false);
    };

    if (goalId) fetchDeposits();
  }, [goalId]);

  const stats = useMemo(() => {
    if (deposits.length === 0) {
      return {
        totalDeposits: 0,
        averageDeposit: 0,
        largestDeposit: 0,
        smallestDeposit: 0,
        monthlyAverage: 0,
        projectedCompletion: null,
        daysActive: 0,
        depositsPerMonth: 0,
        streak: 0,
        remainingAmount: targetAmount - currentAmount,
        progress: targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
      };
    }

    const amounts = deposits.map(d => d.amount);
    const totalDeposits = deposits.length;
    const sum = amounts.reduce((a, b) => a + b, 0);
    const averageDeposit = sum / totalDeposits;
    const largestDeposit = Math.max(...amounts);
    const smallestDeposit = Math.min(...amounts);

    // Calculate monthly average
    const firstDeposit = new Date(deposits[0].created_at);
    const lastDeposit = new Date(deposits[deposits.length - 1].created_at);
    const monthsActive = Math.max(1, differenceInMonths(lastDeposit, firstDeposit) + 1);
    const monthlyAverage = sum / monthsActive;
    const depositsPerMonth = totalDeposits / monthsActive;

    // Days active since creation
    const daysActive = createdAt ? differenceInDays(new Date(), new Date(createdAt)) : 0;

    // Projected completion
    const remainingAmount = Math.max(0, targetAmount - currentAmount);
    let projectedCompletion: Date | null = null;
    
    if (monthlyAverage > 0 && remainingAmount > 0) {
      const monthsNeeded = remainingAmount / monthlyAverage;
      projectedCompletion = new Date();
      projectedCompletion.setMonth(projectedCompletion.getMonth() + Math.ceil(monthsNeeded));
    }

    // Calculate streak (consecutive months with deposits)
    const monthsWithDeposits = new Set(
      deposits.map(d => format(new Date(d.created_at), 'yyyy-MM'))
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const checkDate = new Date(today);
      checkDate.setMonth(checkDate.getMonth() - i);
      const monthKey = format(checkDate, 'yyyy-MM');
      if (monthsWithDeposits.has(monthKey)) {
        streak++;
      } else {
        break;
      }
    }

    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

    return {
      totalDeposits,
      averageDeposit,
      largestDeposit,
      smallestDeposit,
      monthlyAverage,
      projectedCompletion,
      daysActive,
      depositsPerMonth,
      streak,
      remainingAmount,
      progress
    };
  }, [deposits, targetAmount, currentAmount, createdAt]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const statItems = [
    {
      icon: TrendingUp,
      label: "Média Mensal",
      value: formatCurrency(stats.monthlyAverage),
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Award,
      label: "Maior Aporte",
      value: formatCurrency(stats.largestDeposit),
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      icon: Target,
      label: "Total de Aportes",
      value: stats.totalDeposits.toString(),
      subtitle: `~${stats.depositsPerMonth.toFixed(1)}/mês`,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Zap,
      label: "Sequência",
      value: `${stats.streak} ${stats.streak === 1 ? 'mês' : 'meses'}`,
      subtitle: "consecutivos",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    {
      icon: Calendar,
      label: "Previsão de Conclusão",
      value: stats.projectedCompletion 
        ? format(stats.projectedCompletion, "MMM/yyyy", { locale: ptBR })
        : "—",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: Clock,
      label: "Dias Ativos",
      value: stats.daysActive.toString(),
      subtitle: "desde criação",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statItems.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-xl ${item.bgColor} border border-border/50 transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-2 mb-1">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
            </div>
            <div className={`font-bold text-sm ${item.color}`}>{item.value}</div>
            {item.subtitle && (
              <div className="text-[10px] text-muted-foreground">{item.subtitle}</div>
            )}
          </div>
        ))}
      </div>

      {/* Insight Card */}
      {stats.monthlyAverage > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Análise Inteligente</p>
              <p className="text-xs text-muted-foreground mt-1">
                Com sua média de <span className="font-semibold text-primary">{formatCurrency(stats.monthlyAverage)}/mês</span>,
                {stats.remainingAmount > 0 ? (
                  <> você ainda precisa de aproximadamente <span className="font-semibold text-secondary">
                    {Math.ceil(stats.remainingAmount / stats.monthlyAverage)} meses
                  </span> para atingir sua meta.</>
                ) : (
                  <> você já atingiu sua meta! 🎉</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
