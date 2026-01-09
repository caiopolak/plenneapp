import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { InfoTooltip, tooltips } from '@/components/ui/info-tooltip';

interface HealthMetrics {
  score: number;
  savingsRate: number;
  expenseGrowth: number;
  goalProgress: number;
  hasEmergencyFund: boolean;
  diversification: number;
  tips: string[];
  status: 'excellent' | 'good' | 'attention' | 'critical';
}

export function FinancialHealthCard() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  const { data: health, isLoading } = useQuery({
    queryKey: ['financial-health', user?.id, workspace?.id],
    queryFn: async (): Promise<HealthMetrics> => {
      if (!user || !workspace) throw new Error('Not authenticated');

      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      const currentMonthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      // Usar a menor data entre fim do mês e hoje (para não incluir transações futuras)
      const currentMonthEnd = todayStr < format(endOfMonth(now), 'yyyy-MM-dd') ? todayStr : format(endOfMonth(now), 'yyyy-MM-dd');
      const lastMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');
      const lastMonthEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');

      // Transações do mês atual (somente até hoje - transações futuras não afetam)
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .gte('date', currentMonthStart)
        .lte('date', currentMonthEnd);

      // Transações do mês anterior
      const { data: lastTransactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .gte('date', lastMonthStart)
        .lte('date', lastMonthEnd);

      // Metas
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('target_amount, current_amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id);

      // Investimentos
      const { data: investments } = await supabase
        .from('investments')
        .select('type, amount')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id);

      // Cálculos
      const currentIncome = currentTransactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0;
      const currentExpenses = currentTransactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;
      const lastExpenses = lastTransactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;

      // Taxa de economia
      const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;

      // Crescimento de despesas
      const expenseGrowth = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;

      // Progresso das metas
      const totalTarget = goals?.reduce((s, g) => s + Number(g.target_amount), 0) || 0;
      const totalCurrent = goals?.reduce((s, g) => s + Number(g.current_amount || 0), 0) || 0;
      const goalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

      // Diversificação de investimentos
      const investmentTypes = new Set(investments?.map(i => i.type) || []);
      const diversification = Math.min((investmentTypes.size / 6) * 100, 100);

      // Verificar fundo de emergência (simplificado)
      const totalInvested = investments?.reduce((s, i) => s + Number(i.amount), 0) || 0;
      const hasEmergencyFund = totalInvested >= currentExpenses * 3;

      // Calcular score
      let score = 0;
      score += Math.min(savingsRate, 30); // Max 30 pontos por economia
      score += expenseGrowth <= 0 ? 20 : Math.max(0, 20 - expenseGrowth / 5); // Max 20 pontos por controle
      score += Math.min(goalProgress / 2, 20); // Max 20 pontos por metas
      score += diversification / 5; // Max 20 pontos por diversificação
      score += hasEmergencyFund ? 10 : 0; // 10 pontos por reserva

      // Dicas personalizadas
      const tips: string[] = [];
      if (savingsRate < 20) tips.push('Tente economizar pelo menos 20% da sua renda mensal');
      if (expenseGrowth > 10) tips.push('Suas despesas cresceram significativamente - revise seus gastos');
      if (goalProgress < 30) tips.push('Priorize seus depósitos nas metas financeiras');
      if (diversification < 50) tips.push('Diversifique seus investimentos para reduzir riscos');
      if (!hasEmergencyFund) tips.push('Construa uma reserva de emergência de 3-6 meses');

      // Status
      let status: HealthMetrics['status'] = 'excellent';
      if (score < 40) status = 'critical';
      else if (score < 60) status = 'attention';
      else if (score < 80) status = 'good';

      return {
        score: Math.round(Math.max(0, Math.min(100, score))),
        savingsRate,
        expenseGrowth,
        goalProgress,
        hasEmergencyFund,
        diversification,
        tips: tips.slice(0, 3),
        status
      };
    },
    enabled: !!user && !!workspace
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!health) return null;

  const statusConfig = {
    excellent: { 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/30',
      label: 'Excelente',
      icon: CheckCircle2
    },
    good: { 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10', 
      border: 'border-blue-500/30',
      label: 'Bom',
      icon: TrendingUp
    },
    attention: { 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/30',
      label: 'Atenção',
      icon: AlertTriangle
    },
    critical: { 
      color: 'text-red-500', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/30',
      label: 'Crítico',
      icon: TrendingDown
    }
  };

  const config = statusConfig[health.status];
  const StatusIcon = config.icon;

  return (
    <Card className={`relative overflow-hidden ${config.bg} ${config.border} border shadow-xl h-full min-h-[420px] flex flex-col`}>
      {/* Efeito de brilho animado no topo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 animate-shimmer" 
           style={{ color: `hsl(var(--${health.status === 'excellent' ? 'card-success-accent' : health.status === 'good' ? 'card-info-accent' : health.status === 'attention' ? 'card-warning-accent' : 'card-error-accent'}))` }} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <div className={`p-2 rounded-xl ${config.bg} border ${config.border}`}>
              <Heart className={`h-5 w-5 ${config.color} animate-pulse`} />
            </div>
            <span>Saúde Financeira</span>
            <InfoTooltip content={tooltips.financialHealth} />
          </CardTitle>
          <Badge variant="outline" className={`${config.color} border-current px-3 py-1 font-semibold`}>
            <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 flex-1 flex flex-col">
        {/* Score Principal - Maior e mais impactante */}
        <div className="flex items-center gap-6">
          <div className="relative">
            {/* Círculo de fundo com glow */}
            <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${config.bg}`} />
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                {/* Trilha de fundo */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-muted/20"
                />
                {/* Progresso */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${health.score}, 100`}
                  className={`${config.color} transition-all duration-1000 ease-out`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-extrabold ${config.color}`}>{health.score}</span>
                <span className="text-[10px] text-muted-foreground font-medium">de 100</span>
              </div>
            </div>
          </div>
          
          {/* Métricas com barras de progresso visuais */}
          <div className="flex-1 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Taxa de Economia</span>
                <span className={`font-bold ${health.savingsRate >= 20 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {health.savingsRate.toFixed(0)}%
                </span>
              </div>
              <Progress value={Math.min(health.savingsRate, 100)} className={`h-2 ${health.savingsRate >= 20 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-amber-500'}`} />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Variação Despesas</span>
                <span className={`font-bold flex items-center gap-1 ${health.expenseGrowth <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {health.expenseGrowth > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {Math.abs(health.expenseGrowth).toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Progresso Metas</span>
                <span className="font-bold text-foreground">{health.goalProgress.toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(health.goalProgress, 100)} className="h-2 [&>div]:bg-primary" />
            </div>
          </div>
        </div>

        {/* Dicas com visual melhorado */}
        {health.tips.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <Lightbulb className="h-4 w-4 text-amber-500" />
              </div>
              <span className="text-sm font-semibold text-foreground">Dicas personalizadas</span>
            </div>
            <ul className="space-y-2">
              {health.tips.map((tip, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2 bg-muted/30 rounded-lg p-2.5">
                  <span className="text-primary font-bold mt-0.5">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
