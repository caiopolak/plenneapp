import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader as DlgHeader, DialogTitle as DlgTitle } from '@/components/ui/dialog';
import { TransactionForm } from './TransactionForm';
import { ImportTransactionsCSV } from "./ImportTransactionsCSV";
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionSummaryCards } from './TransactionSummaryCards';
import { TransactionListFilters } from './TransactionListFilters';
import { TransactionRow } from './TransactionRow';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

// type Transaction = ... já está explicitado no hook

export function TransactionList() {
  const { transactions, loading, fetchTransactions } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const { current } = useWorkspace();

  // Filtros + memoização
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }
    if (filterMonth !== 'all') {
      const [year, month] = filterMonth.split('-');
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === parseInt(year) &&
          transactionDate.getMonth() === parseInt(month) - 1;
      });
    }
    return filtered;
  }, [transactions, searchTerm, filterType, filterMonth]);

  // Cálculos de totais
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const exportTransactions = () => {
    const csvContent = [
      ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor'],
      ...filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.category,
        t.description || '',
        t.amount.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({
        title: "Sucesso!",
        description: "Transação excluída com sucesso"
      });

      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir transação"
      });
    }
  };

  if (loading) return <div>Carregando transações...</div>;

  return (
    <div className="space-y-6">
      {/* Nova Transação Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          className="max-w-xl w-full rounded-2xl p-4 md:p-6"
          style={{ maxWidth: '96vw', width: '100%', margin: '0 auto' }}
        >
          <DlgHeader>
            <DlgTitle>Nova Transação</DlgTitle>
          </DlgHeader>
          <TransactionForm
            onSuccess={() => {
              setShowForm(false);
              fetchTransactions();
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
      {/* Resumo cards */}
      <TransactionSummaryCards 
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
      />
      {/* Filtros/actions */}
      <Card className="bg-white border-[--primary]/10">
        <CardHeader>
          <TransactionListFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            onExport={exportTransactions}
            onImportSuccess={fetchTransactions}
            showForm={showForm}
            setShowForm={setShowForm}
          />
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 font-text text-[--primary]">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={setEditingTransaction}
                  isEditing={editingTransaction?.id === transaction.id}
                  setEditingTransaction={setEditingTransaction}
                  onDelete={deleteTransaction}
                  refresh={fetchTransactions}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
