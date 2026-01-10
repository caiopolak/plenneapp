import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart3, ChevronDown, ChevronUp, X, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { GoalForm } from './GoalForm';
import { Tables } from '@/integrations/supabase/types';
import { GoalDetailsModalEnhanced } from "./GoalDetailsModalEnhanced";
import { GoalProjectionCard } from "./GoalProjectionCard";
import { GoalDeadlineAlerts } from "./GoalDeadlineAlerts";
import { GoalInsights } from "./GoalInsights";
import { GoalSummaryCards } from "./GoalSummaryCards";
import { CompactGoalFilters, GoalFilters } from "./CompactGoalFilters";
import { GoalCardSkeleton } from "@/components/ui/loading-skeletons";
import { usePaginatedLoad } from "@/hooks/useLazyLoad";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GoalCard } from "./GoalCard";
import { AddValueModal } from "./AddValueModal";
import { FeatureTooltip, featureTooltips } from '@/components/ui/feature-tooltip';

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
  const [showEditForm, setShowEditForm] = useState(false);
  const [detailsGoal, setDetailsGoal] = useState<Goal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState<GoalFilters>(initialFilters);
  const [showAnalytics, setShowAnalytics] = useState(true);
  
  // Add Value Modal State
  const [addValueGoal, setAddValueGoal] = useState<Goal | null>(null);
  const [showAddValueModal, setShowAddValueModal] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const { current } = useWorkspace();

  // Use primitive values for dependencies to ensure proper re-renders
  const userId = user?.id;
  const workspaceId = current?.id;

  const fetchGoals = async () => {
    if (!userId || !workspaceId) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('workspace_id', workspaceId)
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
  }, [userId, workspaceId]);

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

  const addAmountToGoal = async (goalId: string, amount: number, note?: string) => {
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
          note: note || `Aporte na meta "${goal.name}"`
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

      const newProgress = goal.target_amount > 0 
        ? ((newCurrentAmount / goal.target_amount) * 100).toFixed(0)
        : 0;

      toast({
        title: "🎉 Aporte realizado!",
        description: `R$ ${amount.toFixed(2)} adicionado à meta. Progresso: ${newProgress}%`
      });

      setAddValueGoal(null);
      setShowAddValueModal(false);
      fetchGoals();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao adicionar valor à meta"
      });
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

      {/* Dialog para Editar Meta */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-xl w-full rounded-2xl p-4 md:p-6 bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Meta</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <GoalForm
              goal={editingGoal}
              onSuccess={() => {
                setShowEditForm(false);
                setEditingGoal(null);
                fetchGoals();
              }}
              onCancel={() => {
                setShowEditForm(false);
                setEditingGoal(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Valor */}
      {addValueGoal && (
        <AddValueModal
          open={showAddValueModal}
          onOpenChange={(open) => {
            setShowAddValueModal(open);
            if (!open) setAddValueGoal(null);
          }}
          goalName={addValueGoal.name}
          currentAmount={addValueGoal.current_amount || 0}
          targetAmount={addValueGoal.target_amount || 0}
          onConfirm={(amount, note) => addAmountToGoal(addValueGoal.id, amount, note)}
        />
      )}
      
      {/* Header com filtros integrados */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text flex items-center gap-2">
                Metas Financeiras
                <FeatureTooltip {...featureTooltips.goals} />
              </h1>
              {current && (
                <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/5 text-primary text-xs">
                  <Building2 className="w-3 h-3" />
                  {current.name}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Defina objetivos e acompanhe seu progresso rumo aos seus sonhos
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
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-lg font-semibold text-foreground font-text">Comece a sonhar grande!</p>
            <p className="text-sm text-muted-foreground mt-2 font-text max-w-md mx-auto">
              {goals.length === 0 
                ? 'Criar metas é o primeiro passo para transformar seus sonhos em realidade. Que tal começar agora?'
                : 'Nenhuma meta encontrada com os filtros atuais. Tente ajustar os filtros.'}
            </p>
            {goals.length === 0 && (
              <Button 
                className="mt-4 gap-2"
                onClick={() => setShowForm(true)}
              >
                <span>✨</span>
                Criar minha primeira meta
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {displayedGoals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={index}
              onDetails={() => {
                setDetailsGoal(goal);
                setShowDetailsModal(true);
              }}
              onEdit={() => {
                setEditingGoal(goal);
                setShowEditForm(true);
              }}
              onDelete={() => deleteGoal(goal.id)}
              onAddValue={() => {
                setAddValueGoal(goal);
                setShowAddValueModal(true);
              }}
            />
          ))}
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

      {/* Modal de Detalhes Aprimorado */}
      <GoalDetailsModalEnhanced
        open={showDetailsModal}
        onOpenChange={(open) => {
          setShowDetailsModal(open);
          if (!open) setDetailsGoal(null);
        }}
        goal={detailsGoal}
        onAddValue={() => {
          if (detailsGoal) {
            setAddValueGoal(detailsGoal);
            setShowAddValueModal(true);
          }
        }}
        onRefresh={fetchGoals}
      />
    </div>
  );
}
