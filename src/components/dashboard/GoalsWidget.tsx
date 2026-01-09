import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, Flame, Trophy, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface GoalData {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  priority: string | null;
}

export function GoalsWidget() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  const { data, isLoading } = useQuery({
    queryKey: ['goals-widget', user?.id, workspace?.id],
    queryFn: async () => {
      if (!user || !workspace) return null;

      const { data: goals } = await supabase
        .from('financial_goals')
        .select('id, name, target_amount, current_amount, target_date, priority')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id);

      if (!goals) return { goals: [], stats: { total: 0, completed: 0 } };

      const total = goals.length;
      const completed = goals.filter(g => 
        Number(g.current_amount || 0) >= Number(g.target_amount)
      ).length;

      // Filtrar metas não concluídas e ordenar por proximidade de conclusão (maior progresso primeiro)
      const incompleteGoals = goals.filter(g => 
        Number(g.current_amount || 0) < Number(g.target_amount)
      );

      const sortedGoals = incompleteGoals
        .map(g => ({
          ...g,
          progress: (Number(g.current_amount || 0) / Number(g.target_amount)) * 100
        }))
        .sort((a, b) => b.progress - a.progress) // Maior progresso primeiro
        .slice(0, 3);

      return {
        goals: sortedGoals,
        stats: { total, completed }
      };
    },
    enabled: !!user && !!workspace
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'text-[hsl(var(--chart-2))]';
    if (progress >= 50) return 'text-primary';
    if (progress >= 25) return 'text-[hsl(var(--chart-4))]';
    return 'text-muted-foreground';
  };

  const getUrgencyBadge = (targetDate: string | null, progress: number) => {
    if (!targetDate) return null;
    
    const daysLeft = differenceInDays(new Date(targetDate), new Date());
    
    if (daysLeft < 0) {
      return (
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
          Atrasada
        </Badge>
      );
    }
    
    if (daysLeft <= 7) {
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
          <Flame className="w-2.5 h-2.5 mr-0.5" />
          {daysLeft}d
        </Badge>
      );
    }
    
    if (daysLeft <= 30) {
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          <Clock className="w-2.5 h-2.5 mr-0.5" />
          {daysLeft}d
        </Badge>
      );
    }
    
    return null;
  };

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('viagem') || lower.includes('férias')) return '✈️';
    if (lower.includes('carro') || lower.includes('veículo')) return '🚗';
    if (lower.includes('casa') || lower.includes('apartamento') || lower.includes('imóvel')) return '🏠';
    if (lower.includes('emergência') || lower.includes('reserva')) return '🛡️';
    if (lower.includes('estudo') || lower.includes('curso') || lower.includes('faculdade')) return '📚';
    if (lower.includes('casamento')) return '💍';
    if (lower.includes('aposentadoria')) return '🏖️';
    if (lower.includes('eletrônico') || lower.includes('computador') || lower.includes('celular')) return '📱';
    return '🎯';
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-card to-primary/5 border-border shadow-lg h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-3 rounded-lg bg-background/50 border border-border">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data || data.stats.total === 0) {
    return (
      <Card className="bg-gradient-to-br from-card to-primary/5 border-border shadow-lg h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            Metas Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center py-8">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Você ainda não tem metas cadastradas
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/goals">
              Criar primeira meta
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const allCompleted = data.stats.completed === data.stats.total;

  return (
    <Card className="bg-gradient-to-br from-card to-primary/5 border-border shadow-lg h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            Metas Financeiras
          </CardTitle>
          <Badge 
            variant={allCompleted ? "default" : "secondary"} 
            className={`text-xs ${allCompleted ? 'bg-[hsl(var(--chart-2))] text-white' : ''}`}
          >
            {allCompleted ? (
              <>
                <Trophy className="w-3 h-3 mr-1" />
                Todas concluídas!
              </>
            ) : (
              `${data.stats.completed}/${data.stats.total}`
            )}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {allCompleted 
            ? 'Parabéns! Você alcançou todas as suas metas 🎉' 
            : 'Metas mais próximas de conclusão'}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {allCompleted ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--chart-2))]/10 flex items-center justify-center mb-3 animate-pulse">
              <Trophy className="w-8 h-8 text-[hsl(var(--chart-2))]" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Que tal criar novas metas para continuar evoluindo?
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/app/goals">
                Ver todas as metas
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 flex-1">
              {data.goals.map((goal, index) => {
                const progress = (Number(goal.current_amount || 0) / Number(goal.target_amount)) * 100;
                const remaining = Number(goal.target_amount) - Number(goal.current_amount || 0);
                
                return (
                  <div 
                    key={goal.id} 
                    className="p-3 rounded-lg bg-background/60 border border-border/50 hover:border-primary/30 hover:bg-background/80 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg flex-shrink-0">{getCategoryIcon(goal.name)}</span>
                        <span className="text-sm font-medium text-foreground truncate">
                          {goal.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {getUrgencyBadge(goal.target_date, progress)}
                        {goal.priority === 'alta' && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-destructive/50 text-destructive">
                            <TrendingUp className="w-2.5 h-2.5" />
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1.5">
                      <Progress 
                        value={progress} 
                        className="flex-1 h-2"
                      />
                      <span className={`text-xs font-bold min-w-[36px] text-right ${getProgressColor(progress)}`}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        {formatCurrency(Number(goal.current_amount || 0))} de {formatCurrency(Number(goal.target_amount))}
                      </span>
                      <span className="text-primary font-medium">
                        Faltam {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-3 border-t border-border/50">
              <Button asChild variant="ghost" size="sm" className="w-full text-primary hover:text-primary hover:bg-primary/5">
                <Link to="/app/goals">
                  Ver todas as {data.stats.total} metas
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
