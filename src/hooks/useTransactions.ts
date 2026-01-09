
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { safeLog } from '@/lib/security';

type Transaction = Tables<'transactions'>;

export function useTransactions() {
  const { user } = useAuth();
  const { current } = useWorkspace();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  safeLog("info", "useTransactions - init", { workspaceId: current?.id, userId: user?.id });

  const fetchTransactions = useCallback(async () => {
    if (!user || !current?.id) {
      safeLog("info", "useTransactions - No user or workspace, clearing transactions");
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      safeLog("info", "useTransactions - Fetching transactions", { workspaceId: current.id });

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', current.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      safeLog("info", "useTransactions - Found transactions", { count: data?.length || 0 });
      setTransactions(data || []);
    } catch (error) {
      safeLog("error", "useTransactions - Error fetching transactions", { error: String(error) });
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar transações"
      });
    } finally {
      setLoading(false);
    }
  }, [user, current?.id, toast]);

  useEffect(() => {
    safeLog("info", "useTransactions - Effect triggered");
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    setTransactions,
    loading,
    fetchTransactions,
  };
}
