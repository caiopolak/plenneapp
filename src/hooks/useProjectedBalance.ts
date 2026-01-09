import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { addDays, format, parseISO, addWeeks, addMonths, addYears, isBefore, isAfter, startOfDay } from 'date-fns';
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

  useEffect(() => {
    if (!user?.id || !current?.id) return;

    const calculateProjection = async () => {
      try {
        setLoading(true);
        const today = startOfDay(new Date());
        const todayStr = format(today, 'yyyy-MM-dd');
        const futureDate = addDays(today, daysAhead);
        const futureDateStr = format(futureDate, 'yyyy-MM-dd');

        // Calcular saldo atual (transações até hoje)
        const { data: transactionsData, error } = await supabase
          .from('transactions')
          .select('type, amount, date, is_recurring')
          .eq('user_id', user.id)
          .eq('workspace_id', current.id)
          .lte('date', todayStr);

        if (error) throw error;

        let balance = 0;
        (transactionsData || []).forEach(t => {
          // Só contabiliza transações não-recorrentes ou recorrentes que já passaram
          if (!t.is_recurring || t.date <= todayStr) {
            if (t.type === 'income') {
              balance += Number(t.amount);
            } else {
              balance -= Number(t.amount);
            }
          }
        });

        setCurrentBalance(balance);

        // Buscar transações agendadas únicas (incoming_transactions)
        const { data: incomingData } = await supabase
          .from('incoming_transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('workspace_id', current.id)
          .eq('status', 'pending')
          .gte('expected_date', todayStr)
          .lte('expected_date', futureDateStr);

        // Buscar todas transações recorrentes
        const { data: recurringData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('workspace_id', current.id)
          .eq('is_recurring', true)
          .not('recurrence_pattern', 'is', null);

        // Agrupar todas as transações futuras por dia
        const transactionsByDay = new Map<string, number>();

        // Adicionar incoming_transactions
        (incomingData || []).forEach(t => {
          const current = transactionsByDay.get(t.expected_date) || 0;
          const change = t.type === 'income' ? Number(t.amount) : -Number(t.amount);
          transactionsByDay.set(t.expected_date, current + change);
        });

        // Adicionar ocorrências de transações recorrentes
        (recurringData || []).forEach(t => {
          const occurrences = calculateAllOccurrences(
            t.date,
            t.recurrence_pattern,
            t.recurrence_end_date,
            todayStr,
            futureDateStr
          );

          occurrences.forEach(occDate => {
            const current = transactionsByDay.get(occDate) || 0;
            const change = t.type === 'income' ? Number(t.amount) : -Number(t.amount);
            transactionsByDay.set(occDate, current + change);
          });
        });

        // Criar pontos de projeção
        const projectionPoints: ProjectedBalancePoint[] = [
          {
            date: todayStr,
            balance: balance,
            label: 'Hoje'
          }
        ];

        let runningBalance = balance;
        for (let i = 1; i <= daysAhead; i++) {
          const date = addDays(today, i);
          const dateStr = format(date, 'yyyy-MM-dd');
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
        const lastDateStr = futureDateStr;
        if (projectionPoints[projectionPoints.length - 1].date !== lastDateStr) {
          projectionPoints.push({
            date: lastDateStr,
            balance: runningBalance,
            label: format(futureDate, 'dd/MM')
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
  }, [user?.id, current?.id, daysAhead]);

  return { projectedData, currentBalance, loading };
}

/**
 * Calcula todas as ocorrências de uma transação recorrente dentro de um período
 */
function calculateAllOccurrences(
  startDate: string,
  pattern: string,
  endDate: string | null,
  periodStart: string,
  periodEnd: string
): string[] {
  const occurrences: string[] = [];
  let currentDate = parseISO(startDate);
  const periodStartDate = parseISO(periodStart);
  const periodEndDate = parseISO(periodEnd);
  const recurrenceEndDate = endDate ? parseISO(endDate) : null;

  const getNextDate = (date: Date): Date => {
    switch (pattern) {
      case 'weekly':
        return addWeeks(date, 1);
      case 'monthly':
        return addMonths(date, 1);
      case 'yearly':
        return addYears(date, 1);
      default:
        return addMonths(date, 1);
    }
  };

  // Se a data inicial já está no futuro e dentro do período
  if (!isBefore(currentDate, periodStartDate) && !isAfter(currentDate, periodEndDate)) {
    if (!recurrenceEndDate || !isAfter(currentDate, recurrenceEndDate)) {
      occurrences.push(currentDate.toISOString().split('T')[0]);
    }
  }

  // Avançar até encontrar datas dentro do período
  while (isBefore(currentDate, periodStartDate)) {
    currentDate = getNextDate(currentDate);
  }

  // Coletar todas as ocorrências dentro do período
  let maxIterations = 100;
  while (!isAfter(currentDate, periodEndDate) && maxIterations > 0) {
    maxIterations--;
    
    if (recurrenceEndDate && isAfter(currentDate, recurrenceEndDate)) {
      break;
    }

    const dateStr = currentDate.toISOString().split('T')[0];
    
    if (!occurrences.includes(dateStr) && !isBefore(currentDate, periodStartDate)) {
      occurrences.push(dateStr);
    }

    currentDate = getNextDate(currentDate);
  }

  return occurrences;
}
