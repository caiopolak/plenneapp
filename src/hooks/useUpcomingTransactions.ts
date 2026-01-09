import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter, parseISO, startOfDay } from 'date-fns';
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
  recurrence_pattern?: string;
}

export function useUpcomingTransactions(daysAhead: number = 30) {
  const [transactions, setTransactions] = useState<UpcomingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { current } = useWorkspace();

  useEffect(() => {
    if (!user?.id || !current?.id) return;

    const fetchUpcomingTransactions = async () => {
      try {
        setLoading(true);
        const today = startOfDay(new Date());
        const todayStr = today.toISOString().split('T')[0];
        const futureDate = addDays(today, daysAhead);
        const futureDateStr = futureDate.toISOString().split('T')[0];

        // 1. Buscar transações agendadas únicas (incoming_transactions)
        const { data: incomingData, error: incomingError } = await supabase
          .from('incoming_transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('workspace_id', current.id)
          .eq('status', 'pending')
          .gte('expected_date', todayStr)
          .lte('expected_date', futureDateStr)
          .order('expected_date', { ascending: true });

        if (incomingError) throw incomingError;

        const incomingTransactions: UpcomingTransaction[] = (incomingData || []).map(t => ({
          id: t.id,
          type: t.type as 'income' | 'expense',
          amount: Number(t.amount),
          category: t.category,
          description: t.description || '',
          expected_date: t.expected_date,
          source: 'incoming' as const,
          status: t.status
        }));

        // 2. Buscar TODAS as transações recorrentes para calcular ocorrências futuras
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
          // Calcular todas as ocorrências futuras dentro do período
          const occurrences = calculateAllOccurrences(
            t.date,
            t.recurrence_pattern,
            t.recurrence_end_date,
            todayStr,
            futureDateStr
          );

          occurrences.forEach((occDate, index) => {
            recurringTransactions.push({
              id: `${t.id}-occ-${index}`,
              type: t.type as 'income' | 'expense',
              amount: Number(t.amount),
              category: t.category,
              description: t.description || '',
              expected_date: occDate,
              source: 'recurring' as const,
              recurrence_pattern: t.recurrence_pattern
            });
          });
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

  // Função para avançar para a próxima ocorrência
  const getNextDate = (date: Date): Date => {
    switch (pattern) {
      case 'weekly':
        return addWeeks(date, 1);
      case 'monthly':
        return addMonths(date, 1);
      case 'yearly':
        return addYears(date, 1);
      default:
        return addMonths(date, 1); // Default mensal
    }
  };

  // Se a data inicial já está no futuro e dentro do período, inclui ela
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
  let maxIterations = 100; // Segurança contra loop infinito
  while (!isAfter(currentDate, periodEndDate) && maxIterations > 0) {
    maxIterations--;
    
    // Verificar se passou da data de término da recorrência
    if (recurrenceEndDate && isAfter(currentDate, recurrenceEndDate)) {
      break;
    }

    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Evitar duplicatas
    if (!occurrences.includes(dateStr) && !isBefore(currentDate, periodStartDate)) {
      occurrences.push(dateStr);
    }

    currentDate = getNextDate(currentDate);
  }

  return occurrences;
}
