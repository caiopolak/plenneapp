
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { TransactionFieldsGroup } from "./fields/TransactionFieldsGroup";
import { TransactionFormActions } from "./fields/TransactionFormActions";

interface TransactionFormProps {
  onSuccess?: () => void;
  transaction?: any;
  onCancel?: () => void;
}

export function TransactionForm({ onSuccess, transaction, onCancel }: TransactionFormProps) {
  const [type, setType] = useState(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount || '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [date, setDate] = useState<Date>(transaction?.date ? new Date(transaction.date) : new Date());
  const [isRecurring, setIsRecurring] = useState(transaction?.is_recurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState(transaction?.recurrence_pattern || "");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(transaction?.recurrence_end_date || "");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { current } = useWorkspace();
  const isMobile = useIsMobile();

  const workspaceId = current?.id || "";

  console.log("TransactionForm - current workspace:", current?.id);
  console.log("TransactionForm - workspaceId:", workspaceId);

  // Resetar categoria ao mudar tipo
  React.useEffect(() => {
    setCategory('');
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workspaceId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nenhum workspace selecionado. Verifique se você tem acesso a um workspace."
      });
      return;
    }

    if (!amount || !category || !user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    setLoading(true);

    try {
      const transactionData = {
        user_id: user.id,
        workspace_id: workspaceId,
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: format(date, 'yyyy-MM-dd'),
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : null,
        recurrence_end_date: isRecurring ? recurrenceEndDate || null : null
      };

      console.log("TransactionForm - Saving transaction:", transactionData);

      if (transaction) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Transação atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData]);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Transação adicionada com sucesso"
        });
      }

      if (onSuccess) onSuccess();
      
      if (!transaction) {
        setAmount('');
        setCategory('');
        setDescription('');
        setDate(new Date());
        setIsRecurring(false);
      }

    } catch (error) {
      console.error('TransactionForm - Error saving transaction:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar transação"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "w-full",
      isMobile ? "px-3 py-4" : "px-0 py-0"
    )}>
      <Card className={cn(
        "border-0 shadow-none bg-white",
        isMobile ? "rounded-none" : "rounded-xl"
      )}>
        <CardHeader className={cn(
          isMobile ? "px-0 pt-0 pb-3" : "px-2 sm:px-6"
        )}>
          <CardTitle className={cn(
            "text-lg sm:text-xl",
            isMobile && "text-base"
          )}>
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </CardTitle>
          {current && (
            <p className="text-sm text-muted-foreground">
              Workspace: {current.name}
            </p>
          )}
        </CardHeader>
        <CardContent className={cn(
          isMobile ? "px-0" : "px-2 sm:px-6"
        )}>
          <form onSubmit={handleSubmit} className={cn(
            "space-y-4",
            isMobile && "pb-2"
          )}>
            <TransactionFieldsGroup
              type={type} setType={setType}
              amount={amount} setAmount={setAmount}
              category={category} setCategory={setCategory}
              date={date} setDate={setDate}
              description={description} setDescription={setDescription}
              isRecurring={isRecurring} setIsRecurring={setIsRecurring}
              recurrencePattern={recurrencePattern} setRecurrencePattern={setRecurrencePattern}
              recurrenceEndDate={recurrenceEndDate} setRecurrenceEndDate={setRecurrenceEndDate}
              isMobile={isMobile}
            />

            <TransactionFormActions
              loading={loading}
              isMobile={isMobile}
              onCancel={onCancel}
              isEdit={!!transaction}
              formData={{ type, amount, category, description }}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
