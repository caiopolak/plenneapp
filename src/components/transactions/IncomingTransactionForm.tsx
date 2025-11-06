
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { TransactionTypeField } from './fields/TransactionTypeField';
import { TransactionCategoryField } from './fields/TransactionCategoryField';

interface IncomingTransactionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function IncomingTransactionForm({ onSuccess, onCancel }: IncomingTransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [expectedDate, setExpectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workspace?.id || !user || !amount || !category) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('incoming_transactions')
        .insert({
          user_id: user.id,
          workspace_id: workspace.id,
          type,
          amount: parseFloat(amount),
          category,
          description,
          expected_date: format(expectedDate, 'yyyy-MM-dd'),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Transação pendente criada com sucesso"
      });

      // Reset form
      setAmount('');
      setCategory('');
      setDescription('');
      setExpectedDate(new Date());

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao criar transação pendente:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar transação pendente"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Nova Transação Pendente</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TransactionTypeField 
              value={type} 
              onChange={(value) => setType(value as 'income' | 'expense')} 
            />
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <TransactionCategoryField 
            type={type} 
            value={category} 
            onChange={setCategory} 
          />

          <div className="space-y-2">
            <Label>Data Prevista</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(expectedDate, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expectedDate}
                  onSelect={(date) => date && setExpectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a transação..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar Transação Pendente'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
