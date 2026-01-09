
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Calendar, Check, X, Clock, Filter, RefreshCw, Pencil } from 'lucide-react';
import { format, isToday, isTomorrow, addDays, startOfDay, endOfDay } from 'date-fns';
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
  source: 'incoming' | 'recurring';
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
}

type FilterType = 'all' | 'single' | 'recurring';
type FilterPeriod = 'all' | '7days' | '30days' | '90days';

export function IncomingTransactions() {
  const [incomingTransactions, setIncomingTransactions] = useState<IncomingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [editingTransaction, setEditingTransaction] = useState<IncomingTransaction | null>(null);
  const [editForm, setEditForm] = useState({ amount: '', category: '', description: '', expected_date: '' });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();
  const { toast } = useToast();

  const fetchIncomingTransactions = async () => {
    if (!user || !workspace?.id) {
      setIncomingTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const futureLimit = format(addDays(today, 90), 'yyyy-MM-dd');

      const { data: incomingData, error: incomingError } = await supabase
        .from('incoming_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .eq('status', 'pending')
        .order('expected_date', { ascending: true });

      if (incomingError) throw incomingError;

      const { data: recurringData, error: recurringError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('workspace_id', workspace.id)
        .eq('is_recurring', true)
        .gt('date', todayStr)
        .lte('date', futureLimit)
        .order('date', { ascending: true });

      if (recurringError) throw recurringError;

      const incomingMapped: IncomingTransaction[] = (incomingData || []).map(t => ({
        ...t,
        expected_date: t.expected_date,
        source: 'incoming' as const
      }));

      const recurringMapped: IncomingTransaction[] = (recurringData || []).map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description,
        expected_date: t.date,
        status: 'pending',
        user_id: t.user_id,
        workspace_id: t.workspace_id,
        created_at: t.created_at,
        source: 'recurring' as const,
        is_recurring: true,
        recurrence_pattern: t.recurrence_pattern
      }));

      const combined = [...incomingMapped, ...recurringMapped].sort((a, b) => 
        new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime()
      );

      setIncomingTransactions(combined);
    } catch (error) {
      safeLog('error', 'Erro ao buscar transações pendentes', { error: String(error) });
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar transações pendentes" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomingTransactions();
  }, [user, workspace]);

  const filteredTransactions = useMemo(() => {
    let result = incomingTransactions;

    if (filterType === 'single') {
      result = result.filter(t => t.source === 'incoming');
    } else if (filterType === 'recurring') {
      result = result.filter(t => t.source === 'recurring');
    }

    if (filterPeriod !== 'all') {
      const today = startOfDay(new Date());
      let limitDate: Date;
      
      switch (filterPeriod) {
        case '7days': limitDate = endOfDay(addDays(today, 7)); break;
        case '30days': limitDate = endOfDay(addDays(today, 30)); break;
        case '90days': limitDate = endOfDay(addDays(today, 90)); break;
        default: limitDate = endOfDay(addDays(today, 90));
      }

      result = result.filter(t => new Date(t.expected_date) <= limitDate);
    }

    return result;
  }, [incomingTransactions, filterType, filterPeriod]);

  const openEditModal = (transaction: IncomingTransaction) => {
    setEditingTransaction(transaction);
    setEditForm({
      amount: String(transaction.amount),
      category: transaction.category,
      description: transaction.description || '',
      expected_date: transaction.expected_date
    });
  };

  const saveEdit = async () => {
    if (!editingTransaction) return;

    setSaving(true);
    try {
      if (editingTransaction.source === 'recurring') {
        const { error } = await supabase
          .from('transactions')
          .update({
            amount: parseFloat(editForm.amount),
            category: editForm.category,
            description: editForm.description || null,
            date: editForm.expected_date
          })
          .eq('id', editingTransaction.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('incoming_transactions')
          .update({
            amount: parseFloat(editForm.amount),
            category: editForm.category,
            description: editForm.description || null,
            expected_date: editForm.expected_date
          })
          .eq('id', editingTransaction.id);

        if (error) throw error;
      }

      toast({ title: "Sucesso!", description: "Transação atualizada" });
      setEditingTransaction(null);
      fetchIncomingTransactions();
    } catch (error) {
      safeLog('error', 'Erro ao editar transação', { error: String(error) });
      toast({ variant: "destructive", title: "Erro", description: "Erro ao salvar alterações" });
    } finally {
      setSaving(false);
    }
  };

  const confirmTransaction = async (t: IncomingTransaction) => {
    try {
      if (t.source === 'recurring') {
        toast({ title: "Transação Recorrente", description: "Será processada automaticamente na data programada." });
        return;
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: t.user_id,
          workspace_id: t.workspace_id,
          type: t.type,
          amount: t.amount,
          category: t.category,
          description: t.description,
          date: new Date().toISOString().split('T')[0]
        });

      if (transactionError) throw transactionError;

      const { error: updateError } = await supabase
        .from('incoming_transactions')
        .update({ status: 'confirmed' })
        .eq('id', t.id);

      if (updateError) throw updateError;

      toast({ title: "Sucesso!", description: "Transação confirmada e registrada" });
      fetchIncomingTransactions();
    } catch (error) {
      safeLog('error', 'Erro ao confirmar transação', { error: String(error) });
      toast({ variant: "destructive", title: "Erro", description: "Erro ao confirmar transação" });
    }
  };

  const cancelTransaction = async (t: IncomingTransaction) => {
    try {
      if (t.source === 'recurring') {
        const { error } = await supabase.from('transactions').delete().eq('id', t.id);
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Transação recorrente cancelada" });
      } else {
        const { error } = await supabase.from('incoming_transactions').update({ status: 'cancelled' }).eq('id', t.id);
        if (error) throw error;
        toast({ title: "Sucesso!", description: "Transação cancelada" });
      }
      fetchIncomingTransactions();
    } catch (error) {
      safeLog('error', 'Erro ao cancelar transação', { error: String(error) });
      toast({ variant: "destructive", title: "Erro", description: "Erro ao cancelar transação" });
    }
  };

  const getDateBadge = (date: string) => {
    const transactionDate = new Date(date);
    if (isToday(transactionDate)) return <Badge variant="destructive">Hoje</Badge>;
    if (isTomorrow(transactionDate)) return <Badge variant="secondary">Amanhã</Badge>;
    const daysDiff = Math.ceil((transactionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 0) return <Badge variant="destructive">Atrasada</Badge>;
    if (daysDiff <= 7) return <Badge variant="outline">{daysDiff} dias</Badge>;
    return <Badge variant="outline">{format(transactionDate, 'dd/MM', { locale: ptBR })}</Badge>;
  };

  const resetFilters = () => { setFilterType('all'); setFilterPeriod('all'); };
  const hasActiveFilters = filterType !== 'all' || filterPeriod !== 'all';
  const singleCount = incomingTransactions.filter(t => t.source === 'incoming').length;
  const recurringCount = incomingTransactions.filter(t => t.source === 'recurring').length;

  if (loading) return <div>Carregando transações pendentes...</div>;

  return (
    <>
      <Card className="bg-card border-border/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-primary font-display">
              <Clock className="w-5 h-5" />
              Transações Pendentes ({filteredTransactions.length})
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              
              <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos ({incomingTransactions.length})</SelectItem>
                  <SelectItem value="single">Únicas ({singleCount})</SelectItem>
                  <SelectItem value="recurring">Recorrentes ({recurringCount})</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as FilterPeriod)}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="7days">Próx. 7 dias</SelectItem>
                  <SelectItem value="30days">Próx. 30 dias</SelectItem>
                  <SelectItem value="90days">Próx. 90 dias</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 px-2">
                  <RefreshCw className="w-4 h-4 mr-1" />Limpar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>{hasActiveFilters ? 'Nenhuma transação encontrada com os filtros aplicados' : 'Nenhuma transação pendente'}</p>
              {hasActiveFilters && <Button variant="link" onClick={resetFilters} className="mt-2">Limpar filtros</Button>}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted bg-card">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="default" className={transaction.type === 'income' ? 'bg-secondary text-secondary-foreground' : 'bg-destructive text-destructive-foreground'}>
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                      {getDateBadge(transaction.expected_date)}
                      {transaction.source === 'recurring' ? (
                        <Badge variant="outline" className="text-primary border-primary">
                          <Clock className="w-3 h-3 mr-1" />Recorrente
                          {transaction.recurrence_pattern && ` (${transaction.recurrence_pattern === 'weekly' ? 'Semanal' : transaction.recurrence_pattern === 'monthly' ? 'Mensal' : transaction.recurrence_pattern === 'yearly' ? 'Anual' : transaction.recurrence_pattern})`}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground"><Calendar className="w-3 h-3 mr-1" />Única</Badge>
                      )}
                    </div>
                    <div className="font-medium">{transaction.category}</div>
                    {transaction.description && <div className="text-sm text-muted-foreground">{transaction.description}</div>}
                    <div className="text-sm text-muted-foreground">
                      {transaction.source === 'recurring' ? 'Próxima ocorrência: ' : 'Previsto para: '}
                      {format(new Date(transaction.expected_date), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${transaction.type === 'income' ? 'text-secondary' : 'text-destructive'}`}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {Number(transaction.amount).toFixed(2).replace('.', ',')}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(transaction)} title="Editar">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-secondary border-secondary hover:bg-secondary hover:text-secondary-foreground" onClick={() => confirmTransaction(transaction)} title="Confirmar">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => cancelTransaction(transaction)} title="Cancelar">
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

      {/* Modal de edição */}
      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input
                value={editForm.category}
                onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Data prevista</Label>
              <Input
                type="date"
                value={editForm.expected_date}
                onChange={(e) => setEditForm(f => ({ ...f, expected_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingTransaction(null)}>Cancelar</Button>
              <Button onClick={saveEdit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
