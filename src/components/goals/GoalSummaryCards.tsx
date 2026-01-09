import React from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number | null;
  target_date: string | null;
  priority: string | null;
}

interface GoalSummaryCardsProps {
  goals: Goal[];
}

export function GoalSummaryCards({ goals }: GoalSummaryCardsProps) {
  // Calcular estatísticas
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalCurrent = goals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
  const totalRemaining = totalTarget - totalCurrent;
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
  
  const completedCount = goals.filter(g => {
    const progress = g.target_amount > 0 ? ((g.current_amount || 0) / g.target_amount) * 100 : 0;
    return progress >= 100;
  }).length;

  const activeCount = goals.length - completedCount;
  
  const highPriorityCount = goals.filter(g => g.priority === 'high').length;

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total acumulado */}
      <Card className="bg-[hsl(var(--card-success-bg))] shadow-card border border-[hsl(var(--card-success-border))] card-hover group">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[hsl(var(--card-success-text))]">Acumulado</span>
            <div className="p-1.5 rounded-full bg-[hsl(var(--card-success-accent))]/10 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--card-success-accent))]" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-[hsl(var(--card-success-accent))] truncate">
            R$ {formatCurrency(totalCurrent)}
          </div>
          <p className="text-xs text-[hsl(var(--card-success-text))]/70 mt-1">
            {overallProgress.toFixed(0)}% do total
          </p>
        </CardContent>
      </Card>

      {/* Total das metas */}
      <Card className="bg-[hsl(var(--card-info-bg))] shadow-card border border-[hsl(var(--card-info-border))] card-hover group">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[hsl(var(--card-info-text))]">Meta Total</span>
            <div className="p-1.5 rounded-full bg-[hsl(var(--card-info-accent))]/10 group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4 text-[hsl(var(--card-info-accent))]" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-[hsl(var(--card-info-accent))] truncate">
            R$ {formatCurrency(totalTarget)}
          </div>
          <p className="text-xs text-[hsl(var(--card-info-text))]/70 mt-1">
            Faltam R$ {formatCurrency(totalRemaining)}
          </p>
        </CardContent>
      </Card>

      {/* Metas ativas */}
      <Card className="bg-card shadow-card border border-border card-hover group">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Em Andamento</span>
            <div className="p-1.5 rounded-full bg-primary/10 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-foreground">
            {activeCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {highPriorityCount > 0 && `${highPriorityCount} prioritária${highPriorityCount > 1 ? 's' : ''}`}
            {highPriorityCount === 0 && 'meta(s) ativa(s)'}
          </p>
        </CardContent>
      </Card>

      {/* Metas concluídas */}
      <Card className={`shadow-card border card-hover group ${
        completedCount > 0 
          ? 'bg-secondary/10 border-secondary/20' 
          : 'bg-card border-border'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${
              completedCount > 0 ? 'text-secondary' : 'text-muted-foreground'
            }`}>Concluídas</span>
            <div className={`p-1.5 rounded-full group-hover:scale-110 transition-transform ${
              completedCount > 0 ? 'bg-secondary/20' : 'bg-muted'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${
                completedCount > 0 ? 'text-secondary' : 'text-muted-foreground'
              }`} />
            </div>
          </div>
          <div className={`text-lg sm:text-xl font-bold ${
            completedCount > 0 ? 'text-secondary' : 'text-foreground'
          }`}>
            {completedCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {completedCount > 0 ? '🎉 Conquistas!' : 'de ' + goals.length + ' metas'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
