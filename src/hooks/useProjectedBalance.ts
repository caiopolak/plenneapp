import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { addDays, format } from 'date-fns';
import { useUpcomingTransactions } from './useUpcomingTransactions';
import { safeLog } from '@/lib/security';

export interface ProjectedBalancePoint {
  date: string;
  balance: number;
  label: string;
}

export function useProjectedBalance(daysAhead: number = 30) {
  const [projectedData, setProjectedData] = useState<ProjectedBalancePoint[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { current } = useWorkspace();
  const { transactions: upcomingTransactions } = useUpcomingTransactions(daysAhead);

  useEffect(() => {
    if (!user?.id || !current?.id) return;

    const calculateProjection = async () => {
      try {
        setLoading(true);

        // Calcular saldo atual
        const { data: transactionsData, error } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)
          .eq('workspace_id', current.id)
          .lte('date', new Date().toISOString().split('T')[0]);

        if (error) throw error;

        let balance = 0;
        (transactionsData || []).forEach(t => {
          if (t.type === 'income') {
            balance += Number(t.amount);
          } else {
            balance -= Number(t.amount);
          }
        });

        setCurrentBalance(balance);

        // Projetar saldo futuro
        const today = new Date();
        const projectionPoints: ProjectedBalancePoint[] = [
          {
            date: today.toISOString().split('T')[0],
            balance: balance,
            label: 'Hoje'
          }
        ];

        // Agrupar transações futuras por dia
        const transactionsByDay = new Map<string, number>();
        upcomingTransactions.forEach(t => {
          const current = transactionsByDay.get(t.expected_date) || 0;
          const change = t.type === 'income' ? Number(t.amount) : -Number(t.amount);
          transactionsByDay.set(t.expected_date, current + change);
        });

        // Criar pontos de projeção
        let runningBalance = balance;
        for (let i = 1; i <= daysAhead; i++) {
          const date = addDays(today, i);
          const dateStr = date.toISOString().split('T')[0];
          const dayChange = transactionsByDay.get(dateStr) || 0;
          runningBalance += dayChange;

          // Adicionar ponto a cada 7 dias ou quando há mudança de saldo
          if (i % 7 === 0 || dayChange !== 0) {
            projectionPoints.push({
              date: dateStr,
              balance: runningBalance,
              label: format(date, 'dd/MM')
            });
          }
        }

        // Garantir que o último dia está incluído
        const lastDate = addDays(today, daysAhead);
        const lastDateStr = lastDate.toISOString().split('T')[0];
        if (projectionPoints[projectionPoints.length - 1].date !== lastDateStr) {
          projectionPoints.push({
            date: lastDateStr,
            balance: runningBalance,
            label: format(lastDate, 'dd/MM')
          });
        }

        setProjectedData(projectionPoints);
      } catch (error) {
        safeLog('error', 'Error calculating projected balance', { error: String(error) });
      } finally {
        setLoading(false);
      }
    };

    calculateProjection();
  }, [user?.id, current?.id, daysAhead, upcomingTransactions]);

  return { projectedData, currentBalance, loading };
}
