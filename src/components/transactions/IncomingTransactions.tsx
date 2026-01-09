
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Calendar, DollarSign, Check, X, Clock } from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { safeLog } from '@/lib/security';

interface IncomingTransaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  expected_date: string;
  status: string;
  user_id: string;
  workspace_id: string | null;
  created_at: string;
}

export function IncomingTransactions() {
  const [incomingTransactions, setIncomingTransactions] = useState<IncomingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();
  const { toast } = useToast();

  const fetchIncomingTransactions = async () => {
    if (!user || !workspace?.id) {
      safeLog('info', 'IncomingTransactions - No user or workspace, clearing transactions');
      setIncomingTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('incoming_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .eq('status', 'pending')
        .order('expected_date', { ascending: true });

      if (error) throw error;
      setIncomingTransactions(data || []);
    } catch (error) {
      safeLog('error', 'Erro ao buscar transações pendentes', { error: String(error) });
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar transações pendentes"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomingTransactions();
  }, [user, workspace]);

  const confirmTransaction = async (incomingTransaction: IncomingTransaction) => {
    try {
      // Criar transação real
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: incomingTransaction.user_id,
          workspace_id: incomingTransaction.workspace_id,
          type: incomingTransaction.type,
          amount: incomingTransaction.amount,
          category: incomingTransaction.category,
          description: incomingTransaction.description,
          date: new Date().toISOString().split('T')[0]
        });

      if (transactionError) throw transactionError;

      // Marcar como confirmada
      const { error: updateError } = await supabase
        .from('incoming_transactions')
        .update({ status: 'confirmed' })
        .eq('id', incomingTransaction.id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso!",
        description: "Transação confirmada e registrada"
      });

      fetchIncomingTransactions();
    } catch (error) {
      safeLog('error', 'Erro ao confirmar transação', { error: String(error) });
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao confirmar transação"
      });
    }
  };

  const cancelTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('incoming_transactions')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Transação cancelada"
      });

      fetchIncomingTransactions();
    } catch (error) {
      safeLog('error', 'Erro ao cancelar transação', { error: String(error) });
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao cancelar transação"
      });
    }
  };

  const getDateBadge = (date: string) => {
    const transactionDate = new Date(date);
    if (isToday(transactionDate)) {
      return <Badge variant="destructive">Hoje</Badge>;
    }
    if (isTomorrow(transactionDate)) {
      return <Badge variant="secondary">Amanhã</Badge>;
    }
    const daysDiff = Math.ceil((transactionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 0) {
      return <Badge variant="destructive">Atrasada</Badge>;
    }
    if (daysDiff <= 7) {
      return <Badge variant="outline">{daysDiff} dias</Badge>;
    }
    return <Badge variant="outline">{format(transactionDate, 'dd/MM', { locale: ptBR })}</Badge>;
  };

  if (loading) return <div>Carregando transações pendentes...</div>;

  return (
    <Card className="bg-card border-border/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[--primary] font-display">
          <Clock className="w-5 h-5" />
          Transações Pendentes ({incomingTransactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {incomingTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Nenhuma transação pendente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incomingTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted bg-card"
                >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="default"
                      className={
                        transaction.type === 'income'
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-destructive text-destructive-foreground'
                      }
                    >
                      {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </Badge>
                    {getDateBadge(transaction.expected_date)}
                  </div>
                  <div className="font-medium">{transaction.category}</div>
                  {transaction.description && (
                    <div className="text-sm text-muted-foreground">
                      {transaction.description}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Previsto para: {format(new Date(transaction.expected_date), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${
                    transaction.type === 'income' ? 'text-secondary' : 'text-destructive'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}R$ {Number(transaction.amount).toFixed(2).replace('.', ',')}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-secondary border-secondary hover:bg-secondary hover:text-secondary-foreground"
                      onClick={() => confirmTransaction(transaction)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => cancelTransaction(transaction.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
