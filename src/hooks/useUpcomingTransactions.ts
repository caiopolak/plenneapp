import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';
import { addDays, addWeeks, addMonths, addYears, isBefore, parseISO } from 'date-fns';
import { safeLog } from '@/lib/security';

export interface UpcomingTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  expected_date: string;
  source: 'incoming' | 'recurring';
  status?: string;
}

export function useUpcomingTransactions(daysAhead: number = 7) {
  const [transactions, setTransactions] = useState<UpcomingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { current } = useWorkspace();

  useEffect(() => {
    if (!user?.id || !current?.id) return;

    const fetchUpcomingTransactions = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const futureDate = addDays(today, daysAhead);

        // 1. Buscar transações agendadas (incoming_transactions)
        const { data: incomingData, error: incomingError } = await supabase
          .from('incoming_transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('workspace_id', current.id)
          .eq('status', 'pending')
          .gte('expected_date', today.toISOString().split('T')[0])
          .lte('expected_date', futureDate.toISOString().split('T')[0])
          .order('expected_date', { ascending: true });

        if (incomingError) throw incomingError;

        const incomingTransactions: UpcomingTransaction[] = (incomingData || []).map(t => ({
          id: t.id,
          type: t.type as 'income' | 'expense',
          amount: Number(t.amount),
          category: t.category,
          description: t.description || '',
          expected_date: t.expected_date,
          source: 'incoming',
          status: t.status
        }));

        // 2. Buscar transações recorrentes e calcular próximas ocorrências
        const { data: recurringData, error: recurringError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('workspace_id', current.id)
          .eq('is_recurring', true)
          .not('recurrence_pattern', 'is', null);

        if (recurringError) throw recurringError;

        const recurringTransactions: UpcomingTransaction[] = [];

        (recurringData || []).forEach(t => {
          const nextDate = calculateNextOccurrence(
            t.date,
            t.recurrence_pattern,
            t.recurrence_end_date
          );

          if (nextDate && isBefore(parseISO(nextDate), futureDate)) {
            recurringTransactions.push({
              id: `${t.id}-next`,
              type: t.type as 'income' | 'expense',
              amount: Number(t.amount),
              category: t.category,
              description: t.description || '',
              expected_date: nextDate,
              source: 'recurring'
            });
          }
        });

        // Combinar e ordenar
        const allTransactions = [...incomingTransactions, ...recurringTransactions]
          .sort((a, b) => a.expected_date.localeCompare(b.expected_date));

        setTransactions(allTransactions);
      } catch (error: unknown) {
        safeLog('error', 'Error fetching upcoming transactions', { error: String(error) });
        toast.error('Erro ao buscar transações futuras');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingTransactions();
  }, [user?.id, current?.id, daysAhead]);

  return { transactions, loading };
}

function calculateNextOccurrence(
  lastDate: string,
  pattern: string,
  endDate: string | null
): string | null {
  const date = parseISO(lastDate);
  const today = new Date();

  let nextDate: Date;

  switch (pattern) {
    case 'weekly':
      nextDate = addWeeks(date, 1);
      break;
    case 'monthly':
      nextDate = addMonths(date, 1);
      break;
    case 'yearly':
      nextDate = addYears(date, 1);
      break;
    default:
      return null;
  }

  // Verifica se está dentro do período válido
  if (isBefore(nextDate, today)) return null;
  if (endDate && isBefore(parseISO(endDate), nextDate)) return null;

  return nextDate.toISOString().split('T')[0];
}
