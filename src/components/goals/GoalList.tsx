import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Trash2, TrendingUp, BarChart3, ChevronDown, ChevronUp, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GoalForm } from './GoalForm';
import { Tables } from '@/integrations/supabase/types';
import { GoalDetailsModal } from "./GoalDetailsModal";
import { GoalProjectionCard } from "./GoalProjectionCard";
import { GoalDeadlineAlerts } from "./GoalDeadlineAlerts";
import { GoalInsights } from "./GoalInsights";
import { GoalSummaryCards } from "./GoalSummaryCards";
import { CompactGoalFilters, GoalFilters } from "./CompactGoalFilters";
import { GoalCardSkeleton } from "@/components/ui/loading-skeletons";
import { usePaginatedLoad } from "@/hooks/useLazyLoad";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type Goal = Tables<'financial_goals'>;

const initialFilters: GoalFilters = {
  searchTerm: '',
  priority: 'all',
  status: 'all'
};

export function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [addingAmount, setAddingAmount] = useState<string>('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [detailsGoal, setDetailsGoal] = useState<Goal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState<GoalFilters>(initialFilters);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const { toast } = useToast();
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar metas"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Meta excluída com sucesso"
      });
      
      fetchGoals();
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir meta"
      });
    }
  };

  const addAmountToGoal = async (goalId: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal || !user) return;

      const newCurrentAmount = (goal.current_amount || 0) + amount;

      const { error: updateError } = await supabase
        .from('financial_goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', goalId);

      if (updateError) throw updateError;

      const { error: depositError } = await supabase
        .from('goal_deposits')
        .insert([{
          goal_id: goalId,
          user_id: user.id,
          amount: amount,
          note: `Aporte na meta "${goal.name}"`
        }]);
      if (depositError) throw depositError;

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          workspace_id: goal.workspace_id,
          type: 'expense',
          amount: amount,
          category: 'Meta Financeira',
          description: `Aporte: ${goal.name}`,
          date: new Date().toISOString().split('T')[0],
          is_recurring: false
        }]);
      if (transactionError) throw transactionError;

      toast({
        title: "Sucesso!",
        description: `R$ ${amount.toFixed(2)} adicionado à meta (saldo atualizado)`
      });

      setAddingAmount('');
      setSelectedGoalId(null);
      fetchGoals();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao adicionar valor à meta"
      });
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Média';
    }
  };

  // Filtros
  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      const matchesPriority = filters.priority === "all" || g.priority === filters.priority;
      const matchesSearch = !filters.searchTerm || g.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const progress = g.target_amount > 0 ? ((g.current_amount || 0) / g.target_amount) * 100 : 0;
      const isCompleted = progress >= 100;
      const matchesStatus = filters.status === "all" || 
        (filters.status === "completed" && isCompleted) ||
        (filters.status === "active" && !isCompleted);
      
      return matchesPriority && matchesSearch && matchesStatus;
    });
  }, [goals, filters]);

  const resetFilters = () => setFilters(initialFilters);

  // Contagem de filtros ativos
  const activeFiltersCount = [
    filters.priority !== 'all',
    filters.status !== 'all',
  ].filter(Boolean).length;

  const {
    displayedItems: displayedGoals,
    hasMore,
    loadMoreRef,
  } = usePaginatedLoad({
    items: filteredGoals,
    pageSize: 6,
    initialLoad: 6,
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <GoalCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dialog para Nova Meta */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          className="max-w-xl w-full rounded-2xl p-4 md:p-6 bg-card text-foreground"
          style={{ maxWidth: "96vw", width: "100%", margin: "0 auto" }}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Nova Meta</DialogTitle>
          </DialogHeader>
          <GoalForm
            onSuccess={() => {
              setShowForm(false);
              fetchGoals();
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Header com filtros integrados */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
              Metas Financeiras
            </h1>
            <p className="text-muted-foreground text-sm">
              Defina objetivos e acompanhe seu progresso
            </p>
          </div>
          
          {/* Filtros + Ações */}
          <CompactGoalFilters
            filters={filters}
            onFiltersChange={setFilters}
            onReset={resetFilters}
            goals={goals}
            onImportSuccess={fetchGoals}
            onNewGoal={() => setShowForm(true)}
          />
        </div>

        {/* Tags de filtros ativos */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {filters.priority !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {getPriorityLabel(filters.priority)}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, priority: 'all' }))} />
              </Badge>
            )}
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {filters.status === 'completed' ? 'Concluídas' : 'Em andamento'}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, status: 'all' }))} />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Insights inteligentes */}
      {goals.length > 0 && (
        <GoalInsights goals={goals.map(g => ({
          ...g,
          current_amount: g.current_amount || 0
        }))} />
      )}

      {/* Cards de resumo */}
      {goals.length > 0 && (
        <GoalSummaryCards goals={goals.map(g => ({
          ...g,
          current_amount: g.current_amount || 0
        }))} />
      )}

      {/* Seção de Análises - Colapsável */}
      {goals.length > 0 && (
        <Collapsible open={showAnalytics} onOpenChange={setShowAnalytics}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Projeções e Alertas
            </h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {showAnalytics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showAnalytics ? 'Ocultar' : 'Mostrar'}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Alertas de Prazo */}
            <GoalDeadlineAlerts
              goals={goals}
              onGoalClick={(goalId) => {
                const goal = goals.find((g) => g.id === goalId);
                if (goal) {
                  setDetailsGoal(goal);
                  setShowDetailsModal(true);
                }
              }}
            />

            {/* Projeções Inteligentes */}
            <GoalProjectionCard goals={goals.map(g => ({
              ...g,
              current_amount: g.current_amount || 0
            }))} />
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Lista de Metas */}
      {filteredGoals.length === 0 ? (
        <Card className="bg-card border border-border">
          <CardContent className="p-8 text-center rounded-lg">
            <p className="text-lg font-semibold text-foreground font-text">Comece a sonhar grande! 🎯</p>
            <p className="text-sm text-muted-foreground mt-2 font-text">
              {goals.length === 0 
                ? 'Criar metas é o primeiro passo para transformar seus sonhos em realidade.'
                : 'Nenhuma meta encontrada com os filtros atuais.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {displayedGoals.map((goal, index) => {
            const currentAmount = goal.current_amount || 0;
            const targetAmount = goal.target_amount || 0;
            const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
            const isCompleted = progress >= 100;
            
            return (
              <Card 
                key={goal.id} 
                className={`bg-card border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 animate-fade-in opacity-0 ${isCompleted ? 'border-secondary ring-1 ring-secondary/30' : ''}`}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg font-display text-primary truncate">
                        {goal.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                        <Badge variant={getPriorityColor(goal.priority)} className="font-display text-xs">
                          {getPriorityLabel(goal.priority)}
                        </Badge>
                        {isCompleted && (
                          <Badge variant="default" className="bg-secondary text-secondary-foreground font-display text-xs">
                            ✓ Concluída!
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 self-start">
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-display border-secondary text-primary min-h-[40px] sm:min-h-[32px] text-xs sm:text-sm px-2 sm:px-3"
                        onClick={() => {
                          setDetailsGoal(goal);
                          setShowDetailsModal(true);
                        }}
                      >
                        Detalhes
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-primary min-h-[40px] min-w-[40px] sm:min-h-[32px] sm:min-w-[32px]"
                            onClick={() => setEditingGoal(goal)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="font-display text-primary">Editar Meta</DialogTitle>
                          </DialogHeader>
                          {editingGoal && (
                            <GoalForm 
                              goal={editingGoal}
                              onSuccess={() => {
                                setEditingGoal(null);
                                fetchGoals();
                              }}
                              onCancel={() => setEditingGoal(null)}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 min-h-[40px] min-w-[40px] sm:min-h-[32px] sm:min-w-[32px]"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
                      <span className="font-text text-muted-foreground">Progresso</span>
                      <span className={`font-bold ${
                        progress >= 100 ? 'text-secondary' :
                        progress >= 75 ? 'text-[hsl(var(--card-success-accent))]' :
                        'text-foreground'
                      }`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(progress, 100)} 
                      className={`h-2 sm:h-3 ${
                        progress >= 100 ? '[&>div]:bg-secondary' :
                        progress >= 75 ? '[&>div]:bg-[hsl(var(--card-success-accent))]' :
                        '[&>div]:bg-primary'
                      }`} 
                    />
                  </div>
                  
                  {/* Values Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/50">
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-text uppercase tracking-wide">Atual</div>
                      <div className="font-bold text-secondary font-display text-xs sm:text-sm mt-0.5">
                        R$ {currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/50">
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-text uppercase tracking-wide">Meta</div>
                      <div className="font-bold text-primary font-display text-xs sm:text-sm mt-0.5">
                        R$ {targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/50">
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-text uppercase tracking-wide">Faltam</div>
                      <div className="font-bold text-foreground font-display text-xs sm:text-sm mt-0.5">
                        R$ {Math.max(0, targetAmount - currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Date and Note */}
                  {goal.target_date && (
                    <div className="text-xs sm:text-sm text-muted-foreground font-text flex items-center gap-1.5">
                      <span>📅</span>
                      <span>Prazo: {format(new Date(goal.target_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  )}

                  {goal.note && (
                    <div className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded-md">
                      <span className="font-medium not-italic">📝 </span>{goal.note}
                    </div>
                  )}
                  
                  {/* Add Value Button */}
                  {!isCompleted && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full font-display border-secondary text-primary hover:bg-secondary/10 min-h-[44px] sm:min-h-[40px]"
                          onClick={() => setSelectedGoalId(goal.id)}
                        >
                          <TrendingUp className="w-4 h-4 mr-2 text-secondary" />
                          Adicionar Valor
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar valor à meta</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="amount">Valor a adicionar (R$)</Label>
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              value={addingAmount}
                              onChange={(e) => setAddingAmount(e.target.value)}
                              placeholder="0,00"
                              className="min-h-[44px]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => addAmountToGoal(goal.id, parseFloat(addingAmount))}
                              disabled={!addingAmount || parseFloat(addingAmount) <= 0}
                              className="flex-1 min-h-[44px]"
                            >
                              Adicionar
                            </Button>
                            <Button 
                              variant="outline" 
                              className="min-h-[44px]"
                              onClick={() => {
                                setAddingAmount('');
                                setSelectedGoalId(null);
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <GoalCardSkeleton />
            <GoalCardSkeleton />
          </div>
        </div>
      )}
      <GoalDetailsModal
        open={showDetailsModal}
        onOpenChange={(open) => {
          setShowDetailsModal(open);
          if (!open) setDetailsGoal(null);
        }}
        goal={detailsGoal}
        showDepositsHistory
      />
    </div>
  );
}
