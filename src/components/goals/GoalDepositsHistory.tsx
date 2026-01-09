import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Loader2, Edit2, Trash2, Check, X, Undo2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type GoalDeposit = Tables<'goal_deposits'>;

interface GoalDepositsHistoryProps {
  goalId: string;
  goalName?: string;
  workspaceId?: string;
  onDepositChange?: () => void;
}

export function GoalDepositsHistory({ 
  goalId, 
  goalName = "Meta", 
  workspaceId,
  onDepositChange 
}: GoalDepositsHistoryProps) {
  const [deposits, setDeposits] = useState<GoalDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editNote, setEditNote] = useState<string>("");
  const [reversingId, setReversingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchDeposits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('goal_deposits')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false });
    if (!error && data) setDeposits(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeposits();
  }, [goalId]);

  const startEdit = (dep: GoalDeposit) => {
    setEditingId(dep.id);
    setEditValue(dep.amount.toString());
    setEditNote(dep.note || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
    setEditNote("");
  };

  const saveEdit = async (dep: GoalDeposit) => {
    const newAmount = parseFloat(editValue.replace(',', '.'));
    if (isNaN(newAmount) || newAmount <= 0) return toast({ variant: "destructive", title: "Valor inválido" });

    const { error } = await supabase
      .from('goal_deposits')
      .update({ amount: newAmount, note: editNote })
      .eq('id', dep.id);

    if (error) {
      toast({ variant: "destructive", title: "Erro ao atualizar aporte" });
    } else {
      toast({ title: "Aporte atualizado!" });
      setEditingId(null);
      fetchDeposits();
      onDepositChange?.();
    }
  };

  const deleteDeposit = async (dep: GoalDeposit) => {
    const { error } = await supabase
      .from('goal_deposits')
      .delete()
      .eq('id', dep.id);
    if (error) {
      toast({ variant: "destructive", title: "Erro ao excluir aporte" });
    } else {
      toast({ title: "Aporte excluído!" });
      fetchDeposits();
      onDepositChange?.();
    }
  };

  // Estornar aporte: remove do histórico, subtrai da meta e cria transação de entrada
  const reverseDeposit = async (dep: GoalDeposit) => {
    if (!user) return;
    setReversingId(dep.id);

    try {
      const amount = Number(dep.amount);

      // 1. Buscar meta atual para atualizar current_amount
      const { data: goal, error: goalError } = await supabase
        .from('financial_goals')
        .select('current_amount, workspace_id')
        .eq('id', goalId)
        .single();

      if (goalError || !goal) throw new Error("Meta não encontrada");

      const newCurrentAmount = Math.max(0, (goal.current_amount || 0) - amount);
      const goalWorkspaceId = workspaceId || goal.workspace_id;

      // 2. Atualizar current_amount da meta
      const { error: updateError } = await supabase
        .from('financial_goals')
        .update({ current_amount: newCurrentAmount })
        .eq('id', goalId);

      if (updateError) throw updateError;

      // 3. Criar transação de entrada (receita) para restaurar o saldo
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          workspace_id: goalWorkspaceId,
          type: 'income',
          amount: amount,
          category: 'Estorno Meta',
          description: `Estorno de aporte: ${goalName}`,
          date: new Date().toISOString().split('T')[0],
          is_recurring: false
        }]);

      if (transactionError) throw transactionError;

      // 4. Remover depósito do histórico
      const { error: deleteError } = await supabase
        .from('goal_deposits')
        .delete()
        .eq('id', dep.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Aporte estornado!",
        description: `R$ ${amount.toFixed(2)} foi devolvido ao seu saldo.`
      });

      fetchDeposits();
      onDepositChange?.();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao estornar",
        description: "Não foi possível estornar o aporte."
      });
    } finally {
      setReversingId(null);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground text-xs"><Loader2 className="animate-spin h-3 w-3" />Carregando histórico...</div>;
  if (!deposits.length) return <div className="text-xs text-muted-foreground">Nenhum aporte realizado nesta meta ainda.</div>;

  return (
    <div>
      <div className="font-semibold text-sm mb-2 text-primary flex items-center gap-2">
        Histórico de Aportes
        <span className="text-xs text-muted-foreground font-normal">
          ({deposits.length} {deposits.length === 1 ? 'aporte' : 'aportes'})
        </span>
      </div>
      <ul className="divide-y divide-primary/10">
        {deposits.map(dep => (
          <li key={dep.id} className="py-2 flex items-center justify-between text-xs gap-2">
            {editingId === dep.id ? (
              <>
                <div className="flex-1 flex flex-col gap-1">
                  <Input
                    value={editValue}
                    className="h-6 text-xs"
                    onChange={e => setEditValue(e.target.value)}
                    type="number"
                    step="0.01"
                  />
                  <Input
                    value={editNote}
                    className="h-6 text-xs"
                    onChange={e => setEditNote(e.target.value)}
                    placeholder="Observação"
                  />
                </div>
                <div className="flex gap-1 ml-2">
                  <Button variant="secondary" size="sm" className="h-6 w-6 p-0" onClick={() => saveEdit(dep)}><Check size={14} /></Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={cancelEdit}><X size={14} /></Button>
                </div>
              </>
            ) : (
              <>
                <span className="flex-1 truncate">
                  {dep.created_at ? new Date(dep.created_at).toLocaleDateString('pt-BR') : "--"} 
                  {dep.note ? ` - ${dep.note}` : ""}
                </span>
                <span className="font-semibold text-[hsl(var(--chart-2))] w-20 text-right">
                  R$ {Number(dep.amount)?.toFixed(2).replace('.', ',')}
                </span>
                
                {/* Botão Editar */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0" 
                  onClick={() => startEdit(dep)}
                  title="Editar aporte"
                >
                  <Edit2 size={14} />
                </Button>
                
                {/* Botão Estornar */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                      disabled={reversingId === dep.id}
                      title="Estornar aporte (devolve ao saldo)"
                    >
                      {reversingId === dep.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Undo2 size={14} />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Estornar Aporte</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso irá:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Remover R$ {Number(dep.amount).toFixed(2).replace('.', ',')} da meta</li>
                          <li>Criar uma transação de entrada (receita) no seu saldo</li>
                          <li>Excluir este aporte do histórico</li>
                        </ul>
                        <p className="mt-3 font-medium">Deseja continuar?</p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => reverseDeposit(dep)}>
                        Estornar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                {/* Botão Excluir */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      title="Excluir aporte (sem estorno)"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Aporte</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso irá excluir o aporte do histórico, mas <strong>não alterará</strong> o saldo da meta nem criará transação de estorno.
                        <p className="mt-2">Para devolver o valor ao seu saldo, use o botão "Estornar".</p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteDeposit(dep)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir Mesmo Assim
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}