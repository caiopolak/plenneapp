
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Loader2, Edit2, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type GoalDeposit = Tables<'goal_deposits'>;

interface GoalDepositsHistoryProps {
  goalId: string;
}

export function GoalDepositsHistory({ goalId }: GoalDepositsHistoryProps) {
  const [deposits, setDeposits] = useState<GoalDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editNote, setEditNote] = useState<string>("");
  const { toast } = useToast();

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
    }
  };

  const deleteDeposit = async (dep: GoalDeposit) => {
    if (!confirm("Confirma exclusão deste aporte?")) return;
    const { error } = await supabase
      .from('goal_deposits')
      .delete()
      .eq('id', dep.id);
    if (error) {
      toast({ variant: "destructive", title: "Erro ao excluir aporte" });
    } else {
      toast({ title: "Aporte excluído!" });
      fetchDeposits();
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground text-xs"><Loader2 className="animate-spin h-3 w-3" />Carregando histórico...</div>;
  if (!deposits.length) return <div className="text-xs text-muted-foreground">Nenhum aporte realizado nesta meta ainda.</div>;

  return (
    <div>
      <div className="font-semibold text-sm mb-1 text-[--primary]">Histórico de Aportes</div>
      <ul className="divide-y divide-[--primary]/10">
        {deposits.map(dep => (
          <li key={dep.id} className="py-1 flex items-center justify-between text-xs">
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
                  {dep.created_at ? new Date(dep.created_at).toLocaleDateString() : "--"} 
                  {dep.note ? ` - ${dep.note}` : ""}
                </span>
                <span className="font-semibold text-green-700 w-20 text-right">R$ {dep.amount?.toFixed(2).replace('.', ',')}</span>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(dep)}><Edit2 size={14} /></Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => deleteDeposit(dep)}><Trash2 size={14} /></Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
