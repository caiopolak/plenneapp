
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Transaction = Tables<'transactions'>;

export function useTransactions() {
  const { user } = useAuth();
  const { current } = useWorkspace();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("useTransactions - current workspace:", current?.id);
  console.log("useTransactions - user:", user?.id);

  const fetchTransactions = useCallback(async () => {
    if (!user || !current?.id) {
      console.log("useTransactions - No user or workspace, clearing transactions");
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("useTransactions - Fetching transactions for workspace:", current.id);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', current.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      console.log("useTransactions - Found transactions:", data?.length || 0);
      setTransactions(data || []);
    } catch (error) {
      console.error('useTransactions - Error fetching transactions:', error);
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
    console.log("useTransactions - Effect triggered");
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    setTransactions,
    loading,
    fetchTransactions,
  };
}
