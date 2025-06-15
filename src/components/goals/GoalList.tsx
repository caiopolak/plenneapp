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
import { GoalDepositsHistory } from './GoalDepositsHistory'; // NOVO
import { exportGoalsCsv } from './utils/exportGoalsCsv';
import { ImportGoalsCSV } from "./ImportGoalsCSV"; // Novo
import { GoalActionButtons } from "./GoalActionButtons";

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

  if (loading) {
    return <div>Carregando metas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <h2 className="text-2xl font-bold font-display text-[--primary]">Metas Financeiras</h2>
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

      {filteredGoals.length === 0 ? (
        <Card className="bg-[#f4f4f4] border border-[--primary]/10">
          <CardContent className="p-8 text-center rounded-lg">
            <p className="text-muted-foreground font-text">Nenhuma meta criada ainda</p>
            <p className="text-sm text-muted-foreground mt-2 font-text">
              Crie sua primeira meta financeira para começar a planejar seu futuro!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => {
            const currentAmount = goal.current_amount || 0;
            const targetAmount = goal.target_amount || 0;
            const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
            const isCompleted = progress >= 100;
            
            return (
              <Card key={goal.id} className={`bg-white border border-[--primary]/10 ${isCompleted ? 'border-[--secondary]' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-display text-[--primary]">{goal.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={getPriorityColor(goal.priority)} className="font-display">
                          {getPriorityLabel(goal.priority)}
                        </Badge>
                        {isCompleted && (
                          <Badge variant="default" className="bg-[--secondary] text-white font-display">
                            Concluída!
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-display border-[--secondary] text-[--primary]"
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
                            className="text-[--primary]"
                            onClick={() => setEditingGoal(goal)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="font-display text-[--primary]">Editar Meta</DialogTitle>
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
                        className="text-[--error]"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-text">Progresso</span>
                      <span className="font-text">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2 bg-[--primary]/10" />
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground font-text">Atual</div>
                      <div className="font-bold text-[--secondary] font-display">
                        R$ {currentAmount.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-text">Meta</div>
                      <div className="font-bold text-[--primary] font-display">
                        R$ {targetAmount.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-text">Faltam</div>
                      <div className="font-bold text-[--primary] font-display">
                        R$ {Math.max(0, targetAmount - currentAmount).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>
                  
                  {goal.target_date && (
                    <div className="text-sm text-muted-foreground font-text">
                      Data limite: {format(new Date(goal.target_date), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  )}

                  {/* EXIBIR OBSERVAÇÃO, se existir */}
                  {goal.note && (
                    <div className="text-xs text-muted-foreground italic mt-2">
                      <span className="font-medium">Observações:</span> {goal.note}
                    </div>
                  )}
                  
                  {!isCompleted && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full font-display border-[--secondary] text-[--primary] hover:bg-[--secondary]/10"
                          onClick={() => setSelectedGoalId(goal.id)}
                        >
                          <TrendingUp className="w-4 h-4 mr-2 text-[--secondary]" />
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
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => addAmountToGoal(goal.id, parseFloat(addingAmount))}
                              disabled={!addingAmount || parseFloat(addingAmount) <= 0}
                              className="flex-1"
                            >
                              Adicionar
                            </Button>
                            <Button 
                              variant="outline" 
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
