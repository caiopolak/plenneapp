import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface GoalSparklineProps {
  goalId: string;
  className?: string;
}

export function GoalSparkline({ goalId, className = "" }: GoalSparklineProps) {
  const [data, setData] = useState<{ date: string; total: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: deposits } = await supabase
        .from('goal_deposits')
        .select('amount, created_at')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: true })
        .limit(30);

      if (deposits && deposits.length > 0) {
        let cumulative = 0;
        const chartData = deposits.map(dep => {
          cumulative += dep.amount;
          return {
            date: dep.created_at ? new Date(dep.created_at).toLocaleDateString('pt-BR') : '',
            total: cumulative
          };
        });
        setData(chartData);
      }
    };

    if (goalId) fetchData();
  }, [goalId]);

  if (data.length < 2) return null;

  return (
    <div className={`h-10 w-24 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg border">
                    R$ {Number(payload[0].value).toFixed(0)}
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
