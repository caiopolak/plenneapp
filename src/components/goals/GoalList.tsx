import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Trash2, Plus, TrendingUp, Download, Import } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GoalForm } from './GoalForm';
import { Tables } from '@/integrations/supabase/types';
import { GoalDetailsModal } from "./GoalDetailsModal";
import { GoalDepositsHistory } from './GoalDepositsHistory';
import { exportGoalsCsv } from './utils/exportGoalsCsv';
import { ImportGoalsCSV } from "./ImportGoalsCSV";
import { GoalActionButtons } from "./GoalActionButtons";
import { GoalProjectionCard } from "./GoalProjectionCard";
import { GoalDeadlineAlerts } from "./GoalDeadlineAlerts";
import { GoalCardSkeleton } from "@/components/ui/loading-skeletons";
import { usePaginatedLoad } from "@/hooks/useLazyLoad";

type Goal = Tables<'financial_goals'>;

export function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [addingAmount, setAddingAmount] = useState<string>('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [detailsGoal, setDetailsGoal] = useState<Goal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

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
    } catch (error) {
      console.error('Error fetching goals:', error);
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
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir meta"
      });
    }
  };

  // Adiciona valor na meta E gera registro no histórico (goal_deposits)
  const addAmountToGoal = async (goalId: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newCurrentAmount = (goal.current_amount || 0) + amount;

      // Atualiza goal
      const { error: updateError } = await supabase
        .from('financial_goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', goalId);

      if (updateError) throw updateError;

      // Salva depósito no histórico
      const { error: depositError } = await supabase
        .from('goal_deposits')
        .insert([{
          goal_id: goalId,
          user_id: user.id,
          amount: amount,
          note: null // pode ser expandido depois
        }]);
      if (depositError) throw depositError;

      toast({
        title: "Sucesso!",
        description: `R$ ${amount.toFixed(2)} adicionado à meta`
      });

      setAddingAmount('');
      setSelectedGoalId(null);
      fetchGoals();
    } catch (error) {
      console.error('Error adding amount to goal:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao adicionar valor à meta"
      });
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'destructive'; // vermelho
      case 'medium': return 'default';   // azul petróleo (badge padrão)
      case 'low': return 'secondary';    // dourado claro/cinza
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

  // Notificação: meta próxima ou atingida
  useEffect(() => {
    goals.forEach(goal => {
      const currentAmount = goal.current_amount || 0;
      const targetAmount = goal.target_amount || 0;
      const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
      if (progress >= 100) {
        toast({ title: "Parabéns!", description: `Meta "${goal.name}" foi atingida!` });
      } else if (goal.target_date) {
        const dias = Math.ceil((new Date(goal.target_date).getTime() - Date.now())/(1000*60*60*24));
        if (dias <= 5 && dias >= 0) {
          toast({ title: "Meta próxima do prazo", description: `Faltam ${dias} dias para "${goal.name}"!` });
        }
      }
    });
    // eslint-disable-next-line
  }, [goals]);

  // Filtros e busca:
  const filteredGoals = goals.filter(g => {
    const matchesPriority = priorityFilter === "all" || g.priority === priorityFilter;
    const matchesSearch = !search || g.name.toLowerCase().includes(search.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  // Lazy loading para metas
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GoalCardSkeleton />
          <GoalCardSkeleton />
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
          style={{
            maxWidth: "96vw",
            width: "100%",
            margin: "0 auto",
          }}
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
            Metas Financeiras
          </h1>
          <p className="text-muted-foreground">
            Defina objetivos claros, acompanhe seu progresso e celebre cada conquista no caminho da independência financeira.
          </p>
        </div>
        <GoalActionButtons
          goals={goals}
          onSearchChange={e => setSearch(e.target.value)}
          search={search}
          priorityFilter={priorityFilter}
          onPriorityChange={e => setPriorityFilter(e.target.value)}
          onImportSuccess={fetchGoals}
          showForm={showForm}
          setShowForm={setShowForm}
        />
      </div>

      {/* 1. Alertas de Prazo - Importante no topo */}
      {goals.length > 0 && (
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
      )}

      {/* 2. Projeções Inteligentes */}
      {goals.length > 0 && (
        <GoalProjectionCard goals={goals} />
      )}

      {filteredGoals.length === 0 ? (
        <Card className="bg-card border border-border">
          <CardContent className="p-8 text-center rounded-lg">
            <p className="text-lg font-semibold text-foreground font-text">Comece a sonhar grande! 🎯</p>
            <p className="text-sm text-muted-foreground mt-2 font-text">
              Criar metas é o primeiro passo para transformar seus sonhos em realidade. Seja uma viagem, um carro novo ou sua reserva de emergência - defina, acompanhe e conquiste!
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
