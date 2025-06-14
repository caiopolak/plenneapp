import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Trash2, Plus, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GoalForm } from './GoalForm';
import { Tables } from '@/integrations/supabase/types';
import { GoalDetailsModal } from "./GoalDetailsModal";

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

  const addAmountToGoal = async (goalId: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newCurrentAmount = (goal.current_amount || 0) + amount;
      
      const { error } = await supabase
        .from('financial_goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', goalId);

      if (error) throw error;

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

  if (loading) {
    return <div>Carregando metas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Metas Financeiras</h2>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Meta Financeira</DialogTitle>
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
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma meta criada ainda</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie sua primeira meta financeira para começar a planejar seu futuro!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const currentAmount = goal.current_amount || 0;
            const targetAmount = goal.target_amount || 0;
            const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
            const isCompleted = progress >= 100;
            
            return (
              <Card key={goal.id} className={isCompleted ? 'border-green-500' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={getPriorityColor(goal.priority)}>
                          {getPriorityLabel(goal.priority)}
                        </Badge>
                        {isCompleted && (
                          <Badge variant="default" className="bg-green-500">
                            Concluída!
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
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
                            onClick={() => setEditingGoal(goal)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Editar Meta</DialogTitle>
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
                      <span>Progresso</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Atual</div>
                      <div className="font-bold text-green-600">
                        R$ {currentAmount.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Meta</div>
                      <div className="font-bold">
                        R$ {targetAmount.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Faltam</div>
                      <div className="font-bold text-orange-600">
                        R$ {Math.max(0, targetAmount - currentAmount).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>
                  
                  {goal.target_date && (
                    <div className="text-sm text-muted-foreground">
                      Data limite: {format(new Date(goal.target_date), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  )}
                  
                  {!isCompleted && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setSelectedGoalId(goal.id)}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
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
      />
    </div>
  );
}
