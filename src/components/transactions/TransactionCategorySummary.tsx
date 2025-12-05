import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PieChart, TrendingUp, TrendingDown, Tag } from 'lucide-react';

interface CategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface TransactionCategorySummaryProps {
  transactions: Array<{
    type: string;
    amount: number;
    category: string;
  }>;
  filterType: string;
}

export function TransactionCategorySummary({ transactions, filterType }: TransactionCategorySummaryProps) {
  // Agrupar por categoria
  const categoryMap = new Map<string, { income: number; expense: number; count: number }>();
  
  transactions.forEach(t => {
    const existing = categoryMap.get(t.category) || { income: 0, expense: 0, count: 0 };
    if (t.type === 'income') {
      existing.income += Number(t.amount);
    } else {
      existing.expense += Number(t.amount);
    }
    existing.count += 1;
    categoryMap.set(t.category, existing);
  });

  // Calcular totais baseado no filtro
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  // Gerar dados por categoria
  const incomeCategories: CategoryData[] = [];
  const expenseCategories: CategoryData[] = [];

  categoryMap.forEach((data, category) => {
    if (data.income > 0) {
      incomeCategories.push({
        category,
        amount: data.income,
        count: data.count,
        percentage: totalIncome > 0 ? (data.income / totalIncome) * 100 : 0
      });
    }
    if (data.expense > 0) {
      expenseCategories.push({
        category,
        amount: data.expense,
        count: data.count,
        percentage: totalExpense > 0 ? (data.expense / totalExpense) * 100 : 0
      });
    }
  });

  // Ordenar por valor
  incomeCategories.sort((a, b) => b.amount - a.amount);
  expenseCategories.sort((a, b) => b.amount - a.amount);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Cores para categorias
  const categoryColors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-orange-500',
  ];

  const getCategoryColor = (index: number) => categoryColors[index % categoryColors.length];

  const showIncome = filterType === 'all' || filterType === 'income';
  const showExpense = filterType === 'all' || filterType === 'expense';

  if (transactions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Receitas por Categoria */}
      {showIncome && incomeCategories.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Receitas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomeCategories.slice(0, 5).map((cat, index) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getCategoryColor(index)}`} />
                    <span className="text-foreground font-medium truncate max-w-[120px]">
                      {cat.category}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {cat.count}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-semibold">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {cat.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={cat.percentage} 
                  className="h-1.5" 
                />
              </div>
            ))}
            {incomeCategories.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{incomeCategories.length - 5} categorias
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Despesas por Categoria */}
      {showExpense && expenseCategories.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenseCategories.slice(0, 5).map((cat, index) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getCategoryColor(index)}`} />
                    <span className="text-foreground font-medium truncate max-w-[120px]">
                      {cat.category}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {cat.count}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-semibold">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {cat.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={cat.percentage} 
                  className="h-1.5"
                />
              </div>
            ))}
            {expenseCategories.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{expenseCategories.length - 5} categorias
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
