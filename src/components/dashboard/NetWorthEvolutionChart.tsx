import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface NetWorthDataPoint {
  month: string;
  monthLabel: string;
  balance: number;
  investments: number;
  goals: number;
  total: number;
}

export function NetWorthEvolutionChart() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  const { data, isLoading } = useQuery({
    queryKey: ['net-worth-evolution', user?.id, workspace?.id],
    queryFn: async (): Promise<NetWorthDataPoint[]> => {
      if (!user || !workspace) throw new Error('Not authenticated');

      const months: NetWorthDataPoint[] = [];
      const today = new Date();

      // Calcular patrimônio para os últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');
        const monthKey = format(monthDate, 'yyyy-MM');
        const monthLabel = format(monthDate, 'MMM/yy', { locale: ptBR });

        // Transações até o final do mês (saldo acumulado)
        const { data: transactions } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)
          .eq('workspace_id', workspace.id)
          .lte('date', monthEnd);

        let balance = 0;
        (transactions || []).forEach(t => {
          if (t.type === 'income') {
            balance += Number(t.amount);
          } else {
            balance -= Number(t.amount);
          }
        });

        // Investimentos até o final do mês
        const { data: investments } = await supabase
          .from('investments')
          .select('amount')
          .eq('user_id', user.id)
          .eq('workspace_id', workspace.id)
          .lte('purchase_date', monthEnd);

        const investmentsTotal = investments?.reduce((s, i) => s + Number(i.amount), 0) || 0;

        // Metas até o final do mês (current_amount representa valor guardado)
        const { data: goals } = await supabase
          .from('financial_goals')
          .select('current_amount, created_at')
          .eq('user_id', user.id)
          .eq('workspace_id', workspace.id)
          .lte('created_at', `${monthEnd}T23:59:59`);

        const goalsTotal = goals?.reduce((s, g) => s + Number(g.current_amount || 0), 0) || 0;

        months.push({
          month: monthKey,
          monthLabel,
          balance,
          investments: investmentsTotal,
          goals: goalsTotal,
          total: balance + investmentsTotal + goalsTotal
        });
      }

      return months;
    },
    enabled: !!user && !!workspace,
    staleTime: 5 * 60 * 1000 // Cache por 5 minutos
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular variação
  const calculateChange = () => {
    if (!data || data.length < 2) return { value: 0, percentage: 0 };
    const first = data[0].total;
    const last = data[data.length - 1].total;
    const change = last - first;
    const percentage = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
    return { value: change, percentage };
  };

  const change = calculateChange();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Saldo:</span>
              <span className="font-medium">{formatTooltipValue(data.balance)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Investimentos:</span>
              <span className="font-medium">{formatTooltipValue(data.investments)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Metas:</span>
              <span className="font-medium">{formatTooltipValue(data.goals)}</span>
            </div>
            <div className="border-t border-border pt-1 mt-1 flex justify-between gap-4">
              <span className="text-foreground font-medium">Total:</span>
              <span className="font-bold text-primary">{formatTooltipValue(data.total)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução Patrimonial
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={change.value >= 0 ? 'default' : 'destructive'}
              className="flex items-center gap-1"
            >
              {change.value > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : change.value < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {change.percentage >= 0 ? '+' : ''}{change.percentage.toFixed(1)}%
            </Badge>
            <span className="text-sm text-muted-foreground">
              ({change.value >= 0 ? '+' : ''}{formatCurrency(change.value)})
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Acompanhe a evolução do seu patrimônio nos últimos 12 meses
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorInvestments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="monthLabel" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Patrimônio Total"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Patrimônio Total</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Atual: <span className="font-semibold text-foreground">
              {formatTooltipValue(data[data.length - 1]?.total || 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}