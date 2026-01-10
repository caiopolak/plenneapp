import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader as DlgHeader, DialogTitle as DlgTitle } from '@/components/ui/dialog';
import { UnifiedTransactionForm } from './UnifiedTransactionForm';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionSummaryCards } from './TransactionSummaryCards';
import { TransactionRow } from './TransactionRow';
import { TransactionCategorySummary } from './TransactionCategorySummary';
import { TransactionInsights } from './TransactionInsights';
import { TransactionMonthlyComparison } from './TransactionMonthlyComparison';
import { CompactTransactionFilters, TransactionFilters } from './AdvancedTransactionFilters';
import { TransactionActionButtons } from './TransactionActionButtons';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { format, isWithinInterval, parseISO, startOfMonth, subMonths, isSameMonth } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { BarChart3, ChevronDown, ChevronUp, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionRowSkeleton, AnalyticsCardSkeleton } from '@/components/ui/loading-skeletons';
import { usePaginatedLoad } from '@/hooks/useLazyLoad';
import { safeLog } from '@/lib/security';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [showAnalytics, setShowAnalytics] = useState(true);

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

  // Cálculos de totais - APENAS transações até hoje afetam o saldo atual
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const pastTransactions = filteredTransactions.filter(t => new Date(t.date) <= today);
  
  const totalIncome = pastTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = pastTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // Cálculos do mês anterior para comparação
  const lastMonth = startOfMonth(subMonths(new Date(), 1));
  const previousMonthTransactions = transactions.filter(t => 
    isSameMonth(parseISO(t.date), lastMonth)
  );
  const previousIncome = previousMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const previousExpense = previousMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

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

  // Transações para sparkline
  const transactionsForSparkline = transactions.map(t => ({
    type: t.type,
    amount: Number(t.amount),
    date: t.date
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
      safeLog('error', 'Error deleting transaction', { error: String(error) });
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

  // Contagem de filtros ativos para mostrar tags
  const activeFiltersCount = [
    filters.type !== 'all',
    filters.category !== 'all',
    filters.minAmount,
    filters.maxAmount,
    filters.startDate,
    filters.endDate
  ].filter(Boolean).length;

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
      {/* Header com filtros integrados */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
                Transações
              </h1>
              {current && (
                <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/5 text-primary text-xs">
                  <Building2 className="w-3 h-3" />
                  {current.name}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Acompanhe cada entrada e saída do seu dinheiro
            </p>
          </div>
          
          {/* Filtros + Ações no mesmo nível */}
          <div className="flex items-center gap-2 flex-wrap">
            <CompactTransactionFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              onReset={resetFilters}
            />
            <TransactionActionButtons
              onImportSuccess={fetchTransactions}
              showForm={showForm}
              setShowForm={setShowForm}
              transactions={transactionsForExport}
            />
          </div>
        </div>

        {/* Tags de filtros ativos */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {filters.type !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {filters.type === 'income' ? 'Receitas' : 'Despesas'}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, type: 'all' }))} />
              </Badge>
            )}
            {filters.category !== 'all' && (
              <Badge variant="secondary" className="gap-1 text-xs">
                {filters.category}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, category: 'all' }))} />
              </Badge>
            )}
            {filters.minAmount && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Min: R$ {filters.minAmount}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, minAmount: '' }))} />
              </Badge>
            )}
            {filters.maxAmount && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Max: R$ {filters.maxAmount}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, maxAmount: '' }))} />
              </Badge>
            )}
            {filters.startDate && (
              <Badge variant="secondary" className="gap-1 text-xs">
                De: {format(filters.startDate, "dd/MM")}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, startDate: undefined }))} />
              </Badge>
            )}
            {filters.endDate && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Até: {format(filters.endDate, "dd/MM")}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, endDate: undefined }))} />
              </Badge>
            )}
          </div>
        )}
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

      {/* Insights inteligentes */}
      {transactions.length >= 5 && (
        <TransactionInsights transactions={transactions.map(t => ({
          ...t,
          amount: Number(t.amount)
        }))} />
      )}

      {/* 1. Resumo cards - Visão geral no topo */}
      <TransactionSummaryCards 
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        transactions={transactionsForSparkline}
        previousIncome={previousIncome}
        previousExpense={previousExpense}
      />

      {/* 2. Seção de Análises - Colapsável */}
      <Collapsible open={showAnalytics} onOpenChange={setShowAnalytics}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Análises Detalhadas
          </h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {showAnalytics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAnalytics ? 'Ocultar' : 'Mostrar'}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Comparação mensal com gráfico */}
            <div className="lg:col-span-1">
              <TransactionMonthlyComparison transactions={transactions.map(t => ({
                ...t,
                amount: Number(t.amount)
              }))} />
            </div>
            
            {/* Resumo por categoria */}
            <div className="lg:col-span-2">
              <TransactionCategorySummary 
                transactions={filteredTransactions.map(t => ({
                  type: t.type,
                  amount: Number(t.amount),
                  category: t.category
                }))}
                filterType={filters.type}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 3. Lista de Transações */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
            <span>Lista de Transações</span>
            <Badge variant="outline" className="font-normal">
              {filteredTransactions.length} {filteredTransactions.length !== transactions.length && `de ${transactions.length}`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Nenhuma transação por aqui ainda</p>
              <p className="text-sm text-muted-foreground mt-1">
                Registre sua primeira transação clicando em "Nova Transação" ou ajuste os filtros de busca.
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
