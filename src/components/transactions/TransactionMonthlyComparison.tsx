import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  date: string;
}

interface TransactionMonthlyComparisonProps {
  transactions: Transaction[];
}

export function TransactionMonthlyComparison({ transactions }: TransactionMonthlyComparisonProps) {
  const comparisonData = useMemo(() => {
    const now = new Date();
    const months: Array<{
      month: string;
      monthLabel: string;
      income: number;
      expense: number;
      balance: number;
    }> = [];

    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      
      const monthTx = transactions.filter(t => 
        isSameMonth(parseISO(t.date), monthStart)
      );

      const income = monthTx
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expense = monthTx
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      months.push({
        month: format(monthDate, 'MMM', { locale: ptBR }),
        monthLabel: format(monthDate, 'MMMM yyyy', { locale: ptBR }),
        income,
        expense,
        balance: income - expense
      });
    }

    return months;
  }, [transactions]);

  const currentMonth = comparisonData[comparisonData.length - 1];
  const previousMonth = comparisonData[comparisonData.length - 2];

  const incomeChange = previousMonth.income > 0 
    ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100 
    : 0;
  const expenseChange = previousMonth.expense > 0 
    ? ((currentMonth.expense - previousMonth.expense) / previousMonth.expense) * 100 
    : 0;

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const formatTooltip = (value: number) => formatCurrency(value);

  const getChangeIcon = (change: number) => {
    if (change > 5) return <ArrowUpRight className="w-3 h-3" />;
    if (change < -5) return <ArrowDownRight className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getChangeColor = (change: number, isExpense: boolean) => {
    if (isExpense) {
      if (change > 10) return 'text-red-500';
      if (change < -10) return 'text-emerald-500';
    } else {
      if (change > 10) return 'text-emerald-500';
      if (change < -10) return 'text-red-500';
    }
    return 'text-muted-foreground';
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Comparação Mensal
          </CardTitle>
          <Badge variant="outline" className="text-xs capitalize">
            {format(new Date(), 'MMMM', { locale: ptBR })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mini gráfico */}
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={comparisonData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border rounded-lg p-2 shadow-lg">
                        <p className="text-xs font-medium text-foreground capitalize">{label}</p>
                        {payload.map((entry: any, index: number) => (
                          <p key={index} className="text-xs" style={{ color: entry.color }}>
                            {entry.name === 'income' ? 'Receita' : 'Despesa'}: {formatTooltip(entry.value)}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Comparação detalhada */}
        <div className="grid grid-cols-2 gap-4">
          {/* Receitas */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                Receitas
              </span>
              <span className={`text-xs flex items-center gap-0.5 ${getChangeColor(incomeChange, false)}`}>
                {getChangeIcon(incomeChange)}
                {incomeChange.toFixed(0)}%
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(currentMonth.income)}
            </p>
            <Progress 
              value={previousMonth.income > 0 ? Math.min((currentMonth.income / previousMonth.income) * 100, 150) : 100} 
              className="h-1"
            />
          </div>

          {/* Despesas */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-red-500" />
                Despesas
              </span>
              <span className={`text-xs flex items-center gap-0.5 ${getChangeColor(expenseChange, true)}`}>
                {getChangeIcon(expenseChange)}
                {expenseChange.toFixed(0)}%
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(currentMonth.expense)}
            </p>
            <Progress 
              value={previousMonth.expense > 0 ? Math.min((currentMonth.expense / previousMonth.expense) * 100, 150) : 100} 
              className="h-1"
            />
          </div>
        </div>

        {/* Saldo */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${
          currentMonth.balance >= 0 
            ? 'bg-emerald-500/10' 
            : 'bg-red-500/10'
        }`}>
          <span className="text-sm text-muted-foreground">Saldo do mês</span>
          <span className={`font-bold ${
            currentMonth.balance >= 0 ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {currentMonth.balance >= 0 ? '+' : ''}{formatCurrency(currentMonth.balance)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
