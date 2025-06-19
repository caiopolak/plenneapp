import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Repeat, Play, Pause } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  recurrence_pattern: string;
  recurrence_end_date: string | null;
  date: string;
  is_recurring: boolean;
}

export function RecurringTransactionsManager() {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);

  const { data: recurringTransactions, refetch } = useQuery({
    queryKey: ['recurring-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_recurring', true)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as RecurringTransaction[];
    },
    enabled: !!user
  });

  const handleProcessRecurring = async () => {
    if (!user) return;
    
    setProcessing(true);
    try {
      // Call the create_recurring_transactions function directly
      const { error } = await supabase.rpc('create_recurring_transactions');
      
      if (error) throw error;
      
      toast.success('Transações recorrentes processadas com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao processar recorrências:', error);
      toast.error('Erro ao processar transações recorrentes');
    } finally {
      setProcessing(false);
    }
  };

  const getRecurrenceLabel = (pattern: string) => {
    switch (pattern) {
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'yearly': return 'Anual';
      default: return pattern;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-blue-600" />
            <CardTitle>Transações Recorrentes</CardTitle>
          </div>
          <Button
            onClick={handleProcessRecurring}
            disabled={processing}
            size="sm"
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {processing ? 'Processando...' : 'Processar Pendentes'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!recurringTransactions || recurringTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Repeat className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma transação recorrente configurada</p>
            <p className="text-sm">Configure transações recorrentes para automatizar seus lançamentos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recurringTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                      {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </Badge>
                    <Badge variant="outline">
                      {getRecurrenceLabel(transaction.recurrence_pattern)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(transaction.date), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{transaction.description}</h4>
                    <p className="text-sm text-muted-foreground">{transaction.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    {transaction.recurrence_end_date && (
                      <p className="text-xs text-muted-foreground">
                        Até {new Date(transaction.recurrence_end_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
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
