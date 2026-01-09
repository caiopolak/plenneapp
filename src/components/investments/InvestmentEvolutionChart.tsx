import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, parseISO, startOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  expected_return: number | null;
  purchase_date: string | null;
  created_at?: string;
}

interface InvestmentEvolutionChartProps {
  investments: Investment[];
}

export function InvestmentEvolutionChart({ investments }: InvestmentEvolutionChartProps) {
  const chartData = useMemo(() => {
    if (investments.length === 0) return [];

    // Gerar últimos 6 meses
    const months: Date[] = [];
    for (let i = 5; i >= 0; i--) {
      months.push(startOfMonth(subMonths(new Date(), i)));
    }

    // Calcular patrimônio acumulado por mês
    return months.map(month => {
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      // Soma de investimentos feitos até o final deste mês
      const totalAmount = investments.reduce((sum, inv) => {
        const invDate = inv.purchase_date ? parseISO(inv.purchase_date) : (inv.created_at ? parseISO(inv.created_at) : new Date());
        if (invDate <= monthEnd) {
          return sum + inv.amount;
        }
        return sum;
      }, 0);

      // Estimativa de rendimento acumulado (simplificado)
      const avgReturn = investments.reduce((sum, inv) => sum + (inv.expected_return || 0), 0) / (investments.length || 1);
      const monthsFromNow = Math.abs((new Date().getTime() - month.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const estimatedGrowth = totalAmount * (1 + (avgReturn / 100 / 12) * monthsFromNow);

      return {
        month: format(month, 'MMM', { locale: ptBR }),
        fullMonth: format(month, 'MMMM yyyy', { locale: ptBR }),
        patrimonio: Math.round(totalAmount),
        projecao: Math.round(estimatedGrowth),
      };
    });
  }, [investments]);

  if (chartData.length === 0 || chartData.every(d => d.patrimonio === 0)) {
    return null;
  }

  const currentTotal = chartData[chartData.length - 1]?.patrimonio || 0;
  const firstNonZero = chartData.find(d => d.patrimonio > 0)?.patrimonio || currentTotal;
  const growth = firstNonZero > 0 ? ((currentTotal - firstNonZero) / firstNonZero) * 100 : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Evolução do Patrimônio
          </CardTitle>
          {growth !== 0 && (
            <span className={`text-sm font-medium ${growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="patrimonioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={formatCurrency}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Patrimônio']}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullMonth || label}
              />
              <Area
                type="monotone"
                dataKey="patrimonio"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#patrimonioGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
