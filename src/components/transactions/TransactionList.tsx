import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader as DlgHeader, DialogTitle as DlgTitle } from '@/components/ui/dialog';
import { UnifiedTransactionForm } from './UnifiedTransactionForm';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionSummaryCards } from './TransactionSummaryCards';
import { TransactionRow } from './TransactionRow';
import { TransactionCategorySummary } from './TransactionCategorySummary';
import { AdvancedTransactionFilters, TransactionFilters } from './AdvancedTransactionFilters';
import { TransactionActionButtons } from './TransactionActionButtons';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { format, isWithinInterval, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionRowSkeleton, AnalyticsCardSkeleton } from '@/components/ui/loading-skeletons';
import { usePaginatedLoad } from '@/hooks/useLazyLoad';

const initialFilters: TransactionFilters = {
  searchTerm: '',
  type: 'all',
  category: 'all',
  minAmount: '',
  maxAmount: '',
  startDate: undefined,
  endDate: undefined
};

export function TransactionList() {
  const { transactions, loading, fetchTransactions } = useTransactions();
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategorySummary, setShowCategorySummary] = useState(true);

  const { toast } = useToast();
  const { user } = useAuth();
  const { current } = useWorkspace();

  // Extrair categorias únicas
  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  // Filtros avançados + memoização
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Busca por texto
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search)
      );
    }

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Filtro por categoria
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Filtro por valor mínimo
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      filtered = filtered.filter(t => Number(t.amount) >= min);
    }

    // Filtro por valor máximo
    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      filtered = filtered.filter(t => Number(t.amount) <= max);
    }

    // Filtro por período
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(t => {
        const transactionDate = parseISO(t.date);
        if (filters.startDate && filters.endDate) {
          return isWithinInterval(transactionDate, {
            start: filters.startDate,
            end: filters.endDate
          });
        }
        if (filters.startDate) {
          return transactionDate >= filters.startDate;
        }
        if (filters.endDate) {
          return transactionDate <= filters.endDate;
        }
        return true;
      });
    }

    return filtered;
  }, [transactions, filters]);

  // Cálculos de totais
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // Mapear transações para formato de exportação
  const transactionsForExport = filteredTransactions.map(t => ({
    date: t.date,
    type: t.type,
    category: t.category,
    description: t.description || '',
    amount: Number(t.amount),
    is_recurring: t.is_recurring || false,
    recurrence_pattern: t.recurrence_pattern || null,
  }));

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

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Lazy loading para transações
  const {
    displayedItems: displayedTransactions,
    hasMore,
    loadMoreRef,
  } = usePaginatedLoad({
    items: filteredTransactions,
    pageSize: 20,
    initialLoad: 20,
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnalyticsCardSkeleton />
          <AnalyticsCardSkeleton />
          <AnalyticsCardSkeleton />
        </div>
        <Card className="bg-card">
          <CardContent className="p-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <TransactionRowSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
            Transações
          </h1>
          <p className="text-muted-foreground">
            {filteredTransactions.length} transações encontradas
            {filteredTransactions.length !== transactions.length && (
              <span className="text-xs ml-2">(de {transactions.length} no total)</span>
            )}
          </p>
        </div>
        <TransactionActionButtons
          onImportSuccess={fetchTransactions}
          showForm={showForm}
          setShowForm={setShowForm}
          transactions={transactionsForExport}
        />
      </div>

      {/* Nova Transação Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          className="max-w-xl w-full rounded-2xl p-4 md:p-6 bg-card text-foreground"
          style={{ maxWidth: '96vw', width: '100%', margin: '0 auto' }}
        >
          <DlgHeader>
            <DlgTitle className="text-foreground">Nova Transação</DlgTitle>
          </DlgHeader>
          <UnifiedTransactionForm
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

      {/* Filtros Avançados */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <AdvancedTransactionFilters
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
            onReset={resetFilters}
          />
        </CardContent>
      </Card>

      {/* Resumo por Categoria (toggle) */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Análise por Categoria</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCategorySummary(!showCategorySummary)}
        >
          {showCategorySummary ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          {showCategorySummary ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>

      {showCategorySummary && (
        <TransactionCategorySummary 
          transactions={filteredTransactions}
          filterType={filters.type}
        />
      )}

      {/* Lista de Transações */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
            <span>Lista de Transações</span>
            <Badge variant="outline">{filteredTransactions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Nenhuma transação encontrada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar os filtros ou adicione uma nova transação
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {displayedTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="animate-fade-in opacity-0"
                    style={{
                      animationDelay: `${Math.min(index * 30, 300)}ms`,
                      animationFillMode: 'forwards',
                    }}
                  >
                    <TransactionRow
                      transaction={transaction}
                      onEdit={setEditingTransaction}
                      isEditing={editingTransaction?.id === transaction.id}
                      setEditingTransaction={setEditingTransaction}
                      onDelete={deleteTransaction}
                      refresh={fetchTransactions}
                    />
                  </div>
                ))}
              </div>
              
              {/* Load More Trigger */}
              {hasMore && (
                <div ref={loadMoreRef} className="py-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <TransactionRowSkeleton key={i} />
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
