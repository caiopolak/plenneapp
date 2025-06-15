import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus, Download, Import } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionForm } from './TransactionForm';
import { Tables } from '@/integrations/supabase/types';
import { ImportTransactionsCSV } from "./ImportTransactionsCSV";

type Transaction = Tables<'transactions'>;

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar transações"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  useEffect(() => {
    let filtered = transactions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by month
    if (filterMonth !== 'all') {
      const [year, month] = filterMonth.split('-');
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === parseInt(year) && 
               transactionDate.getMonth() === parseInt(month) - 1;
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterType, filterMonth]);

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

  const exportTransactions = () => {
    const csvContent = [
      ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor'],
      ...filteredTransactions.map(t => [
        format(new Date(t.date), 'dd/MM/yyyy'),
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
    a.download = `transacoes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  if (loading) {
    return <div>Carregando transações...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white shadow-card border border-[--primary]/10">
          <CardContent className="p-4">
            <div className="text-sm text-[--primary] font-text">Receitas</div>
            <div className="text-2xl font-bold text-[--secondary] font-display">
              R$ {totalIncome.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-card border border-[--primary]/10">
          <CardContent className="p-4">
            <div className="text-sm text-[--primary] font-text">Despesas</div>
            <div className="text-2xl font-bold text-[--error] font-display">
              R$ {totalExpense.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#eaf6ee]/80 shadow-card border border-[--primary]/10">
          <CardContent className="p-4">
            <div className="text-sm text-[--primary] font-text">Saldo</div>
            <div className={`text-2xl font-bold font-display ${balance >= 0 ? 'text-[--secondary]' : 'text-[--error]'}`}>
              R$ {balance.toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-white border-[--primary]/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="font-display text-[--primary]">Transações</CardTitle>
            <div className="flex gap-2">
              {/* ... keep Dialog for add/import csv ... */}
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button className="font-display bg-[--secondary] text-white hover:bg-[--primary]">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Transação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nova Transação</DialogTitle>
                  </DialogHeader>
                  <TransactionForm 
                    onSuccess={() => {
                      setShowForm(false);
                      fetchTransactions();
                    }}
                    onCancel={() => setShowForm(false)}
                  />
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="font-display border-[--primary] text-[--primary] hover:bg-[--primary]/5">
                    <Import className="w-4 h-4 mr-2" />
                    Importar CSV
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Importar transações em lote</DialogTitle>
                  </DialogHeader>
                  <ImportTransactionsCSV onSuccess={fetchTransactions} />
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="font-display border-[--primary] text-[--primary] hover:bg-[--primary]/5" onClick={exportTransactions}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          {/* ... keep filters: search, selects ... */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full font-text"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40 font-text border-[--primary]/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-full md:w-40 font-text border-[--primary]/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                <SelectItem value="2024-12">Dezembro 2024</SelectItem>
                <SelectItem value="2024-11">Novembro 2024</SelectItem>
                <SelectItem value="2024-10">Outubro 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 font-text text-[--primary]">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-[#eaf6ee] bg-white"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="default"
                        className={
                          transaction.type === 'income'
                            ? 'bg-[--secondary] text-white font-display'
                            : 'bg-[--error] text-white font-display'
                        }
                      >
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                      {transaction.is_recurring && (
                        <Badge variant="outline" className="font-text text-[--primary] border-[--primary]/30 bg-[#f4f4f4]">Recorrente</Badge>
                      )}
                    </div>
                    <div className="mt-1 font-text">
                      <span className="font-medium">{transaction.category}</span>
                      {transaction.description && (
                        <span className="text-muted-foreground ml-2">
                          - {transaction.description}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground font-text">
                      {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold font-display ${
                      transaction.type === 'income' ? 'text-[--secondary]' : 'text-[--error]'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {Number(transaction.amount).toFixed(2).replace('.', ',')}
                    </span>
                    
                    {/* ... keep Dialogs for editing ... */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[--primary] font-display"
                          onClick={() => setEditingTransaction(transaction)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Transação</DialogTitle>
                        </DialogHeader>
                        {editingTransaction && (
                          <TransactionForm 
                            transaction={editingTransaction}
                            onSuccess={() => {
                              setEditingTransaction(null);
                              fetchTransactions();
                            }}
                            onCancel={() => setEditingTransaction(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[--error]"
                      onClick={() => deleteTransaction(transaction.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
