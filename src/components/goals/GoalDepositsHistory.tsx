
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

type GoalDeposit = Tables<'goal_deposits'>;

interface GoalDepositsHistoryProps {
  goalId: string;
}

export function GoalDepositsHistory({ goalId }: GoalDepositsHistoryProps) {
  const [deposits, setDeposits] = useState<GoalDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchDeposits();
  }, [goalId]);

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground text-xs"><Loader2 className="animate-spin h-3 w-3" />Carregando histórico...</div>;
  if (!deposits.length) return <div className="text-xs text-muted-foreground">Nenhum aporte realizado nesta meta ainda.</div>;

  return (
    <div>
      <div className="font-semibold text-sm mb-1 text-[--primary]">Histórico de Aportes</div>
      <ul className="divide-y divide-[--primary]/10">
        {deposits.map(dep => (
          <li key={dep.id} className="py-1 flex items-center justify-between text-xs">
            <span>
              {dep.created_at ? new Date(dep.created_at).toLocaleDateString() : "--"} 
              {dep.note ? ` - ${dep.note}` : ""}
            </span>
            <span className="font-semibold text-green-700">R$ {dep.amount?.toFixed(2).replace('.', ',')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
