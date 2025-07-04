import React, { useState } from 'react';
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
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TransactionPendingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    type: string;
    amount: string;
    category: string;
    description: string;
  };
}

export function TransactionPendingForm({ onSuccess, onCancel, initialData }: TransactionPendingFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type as 'income' | 'expense' || 'expense');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [expectedDate, setExpectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();
  const isMobile = useIsMobile();

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
        description: "Transação agendada com sucesso"
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao criar transação pendente:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao agendar transação"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full", isMobile ? "px-0" : "px-2")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TransactionTypeField 
            value={type} 
            onChange={(value) => setType(value as 'income' | 'expense')} 
          />
          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
              className={cn(isMobile && "h-12")}
            />
          </div>
        </div>

        <TransactionCategoryField 
          type={type} 
          value={category} 
          onChange={setCategory} 
        />

        <div className="space-y-2">
          <Label>Data Prevista *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  isMobile && "h-12"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(expectedDate, "dd/MM/yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
            className={cn(isMobile && "min-h-[80px]")}
          />
        </div>

        <div className={cn(
          "flex gap-2 pt-4",
          isMobile && "flex-col"
        )}>
          <Button 
            type="submit" 
            disabled={loading} 
            className={cn(
              "flex-1",
              isMobile && "h-12 text-base"
            )}
          >
            {loading ? 'Agendando...' : 'Agendar Transação'}
          </Button>
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className={cn(
                isMobile && "h-12 text-base"
              )}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}