
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type GoalDeposit = Tables<'goal_deposits'>;

interface GoalProgressChartProps {
  goalId: string;
  targetAmount: number;
}

export function GoalProgressChart({ goalId, targetAmount }: GoalProgressChartProps) {
  const [data, setData] = useState<{date: string, saldo: number}[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const { data: deposits } = await supabase
        .from('goal_deposits')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: true });

      let saldo = 0;
      const chartData = (deposits || []).map(dep => {
        saldo += dep.amount;
        return {
          date: dep.created_at ? new Date(dep.created_at).toLocaleDateString('pt-BR') : '',
          saldo: parseFloat(saldo.toFixed(2))
        }
      });
      setData(chartData);
    }
    if (goalId && targetAmount > 0) fetchData();
  }, [goalId, targetAmount]);

  if (!goalId || targetAmount <= 0) return null;
  if (data.length === 0) return <div className="text-xs text-muted-foreground">Sem aportes suficientes para gráfico.</div>;

  return (
    <div className="mt-4 w-full">
      <div className="font-semibold mb-1 text-sm text-[--secondary]">Evolução dos Aportes</div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, targetAmount]} tickFormatter={v => `R$ ${v.toFixed(0)}`} />
          <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
          <Line type="monotone" dataKey="saldo" stroke="#00875a" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
