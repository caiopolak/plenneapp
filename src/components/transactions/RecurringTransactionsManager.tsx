
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Calendar, 
  Repeat, 
  Pause, 
  Play, 
  Trash2,
  Settings
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  recurrence_pattern: string;
  recurrence_end_date: string | null;
  date: string;
  is_recurring: boolean;
}

export function RecurringTransactionsManager() {
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();
  const queryClient = useQueryClient();

  // Buscar transações recorrentes
  const { data: recurringTransactions, isLoading } = useQuery({
    queryKey: ['recurring-transactions', user?.id, workspace?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace?.id)
        .eq('is_recurring', true)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as RecurringTransaction[];
    },
    enabled: !!user && !!workspace
  });

  // Executar função de recorrência
  const executeRecurrenceMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('create_recurring_transactions');
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Transações recorrentes processadas!');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao processar recorrências: ${error.message}`);
    }
  });

  // Pausar/reativar recorrência
  const toggleRecurrenceMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('transactions')
        .update({ is_recurring: !isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Status da recorrência atualizado!');
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar recorrência: ${error.message}`);
    }
  });

  // Excluir recorrência
  const deleteRecurrenceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Recorrência excluída!');
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir recorrência: ${error.message}`);
    }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPatternLabel = (pattern: string) => {
    switch (pattern) {
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'yearly': return 'Anual';
      default: return pattern;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Transações Recorrentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Transações Recorrentes
        </CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={() => executeRecurrenceMutation.mutate()}
            disabled={executeRecurrenceMutation.isPending}
            size="sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            {executeRecurrenceMutation.isPending ? 'Processando...' : 'Processar Agora'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!recurringTransactions || recurringTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Repeat className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma transação recorrente encontrada.</p>
            <p className="text-sm">Crie transações com recorrência para vê-las aqui.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recurringTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{transaction.description}</h4>
                      <Badge 
                        variant={transaction.type === 'income' ? 'default' : 'destructive'}
                      >
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                      <Badge variant="outline">
                        {getPatternLabel(transaction.recurrence_pattern)}
                      </Badge>
                      {transaction.is_recurring ? (
                        <Badge variant="default">
                          <Play className="h-3 w-3 mr-1" />
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Pause className="h-3 w-3 mr-1" />
                          Pausada
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Valor:</span><br />
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div>
                        <span className="font-medium">Categoria:</span><br />
                        {transaction.category}
                      </div>
                      <div>
                        <span className="font-medium">Início:</span><br />
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        <span className="font-medium">Fim:</span><br />
                        {transaction.recurrence_end_date 
                          ? new Date(transaction.recurrence_end_date).toLocaleDateString('pt-BR')
                          : 'Indefinido'
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRecurrenceMutation.mutate({ 
                        id: transaction.id, 
                        isActive: transaction.is_recurring 
                      })}
                      disabled={toggleRecurrenceMutation.isPending}
                    >
                      {transaction.is_recurring ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteRecurrenceMutation.mutate(transaction.id)}
                      disabled={deleteRecurrenceMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
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
