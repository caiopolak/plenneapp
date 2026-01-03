import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { cn } from '@/lib/utils';
import { transactionSchema, validateInput, requireAuth, requireWorkspace, isValidationError } from '@/lib/validation';
import { checkRateLimit, safeLog } from '@/lib/security';
import { TransactionFieldsGroup } from "./fields/TransactionFieldsGroup";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CreditCard, Crown } from 'lucide-react';

interface UnifiedTransactionFormProps {
  onSuccess?: () => void;
  transaction?: any;
  onCancel?: () => void;
  initialMode?: 'immediate' | 'scheduled';
}

export function UnifiedTransactionForm({ 
  onSuccess, 
  transaction, 
  onCancel,
  initialMode = 'immediate'
}: UnifiedTransactionFormProps) {
  const [mode, setMode] = useState<'immediate' | 'scheduled'>(initialMode);
  const [type, setType] = useState(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount || '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [date, setDate] = useState<Date>(transaction?.date ? new Date(transaction.date) : new Date());
  const [expectedDate, setExpectedDate] = useState<Date>(new Date());
  const [isRecurring, setIsRecurring] = useState(transaction?.is_recurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState(transaction?.recurrence_pattern || "");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(transaction?.recurrence_end_date || "");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { current } = useWorkspace();
  const isMobile = useIsMobile();
  const { limits, checkLimit } = useSubscriptionLimits();

  const workspaceId = current?.id || "";

  // Resetar categoria ao mudar tipo
  React.useEffect(() => {
    setCategory('');
  }, [type]);

  const canUseFeature = (feature: 'scheduling' | 'recurring') => {
    if (!limits) return true;
    
    if (feature === 'scheduling' && limits.plan === 'free') {
      return false;
    }
    
    if (feature === 'recurring' && limits.plan === 'free') {
      return false;
    }
    
    return true;
  };

  const showUpgradePrompt = (feature: string) => {
    toast({
      title: "Recurso Premium",
      description: `${feature} está disponível apenas nos planos Pro e Business. Faça upgrade para desbloquear!`,
      action: <Badge variant="secondary" className="ml-2"><Crown className="w-3 h-3 mr-1" />Upgrade</Badge>
    });
  };

  const handleModeChange = (newMode: 'immediate' | 'scheduled') => {
    if (newMode === 'scheduled' && !canUseFeature('scheduling')) {
      showUpgradePrompt('Agendamento de transações');
      return;
    }
    setMode(newMode);
  };

  const handleRecurringChange = (recurring: boolean) => {
    if (recurring && !canUseFeature('recurring')) {
      showUpgradePrompt('Transações recorrentes');
      return;
    }
    setIsRecurring(recurring);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!checkRateLimit(`transaction_submit_${user?.id}`, 30, 60000)) {
      toast({
        variant: "destructive",
        title: "Muitas tentativas",
        description: "Aguarde um momento antes de tentar novamente"
      });
      return;
    }

    // Auth and workspace validation
    try {
      requireAuth(user?.id);
      requireWorkspace(workspaceId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro de autenticação"
      });
      return;
    }

    // Validate input with Zod schema
    const validation = validateInput(transactionSchema, {
      type,
      amount,
      category,
      description,
      date: mode === 'immediate' ? date : expectedDate,
      is_recurring: isRecurring && canUseFeature('recurring'),
      recurrence_pattern: isRecurring && canUseFeature('recurring') ? recurrencePattern : null,
      recurrence_end_date: isRecurring && canUseFeature('recurring') ? recurrenceEndDate : null
    });

    if (isValidationError(validation)) {
      const firstError = Object.values(validation.errors)[0];
      toast({
        variant: "destructive",
        title: "Dados inválidos",
        description: firstError || "Verifique os campos do formulário"
      });
      safeLog('warn', 'Transaction validation failed', validation.errors);
      return;
    }

    // Verificar limites antes de salvar
    if (!transaction) {
      const canProceed = await checkLimit('transactions');
      if (!canProceed) return;
    }

    setLoading(true);

    try {
      if (mode === 'immediate') {
        // Transação imediata
        const transactionData = {
          user_id: user.id,
          workspace_id: workspaceId,
          type,
          amount: parseFloat(amount),
          category,
          description,
          date: format(date, 'yyyy-MM-dd'),
          is_recurring: isRecurring && canUseFeature('recurring'),
          recurrence_pattern: isRecurring && canUseFeature('recurring') ? recurrencePattern : null,
          recurrence_end_date: isRecurring && canUseFeature('recurring') ? recurrenceEndDate || null : null
        };

        if (transaction) {
          const { error } = await supabase
            .from('transactions')
            .update(transactionData)
            .eq('id', transaction.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('transactions')
            .insert([transactionData]);
          if (error) throw error;
        }

        toast({
          title: "Sucesso!",
          description: transaction ? "Transação atualizada!" : "Transação adicionada!"
        });

      } else {
        // Transação agendada
        if (isRecurring && canUseFeature('recurring')) {
          // Transação recorrente agendada - salva em transactions com data futura
          const transactionData = {
            user_id: user.id,
            workspace_id: workspaceId,
            type,
            amount: parseFloat(amount),
            category,
            description,
            date: format(expectedDate, 'yyyy-MM-dd'),
            is_recurring: true,
            recurrence_pattern: recurrencePattern || null,
            recurrence_end_date: recurrenceEndDate || null
          };

          const { error } = await supabase
            .from('transactions')
            .insert([transactionData]);

          if (error) throw error;

          toast({
            title: "Sucesso!",
            description: "Transação recorrente agendada com sucesso!",
            action: <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Recorrente</Badge>
          });
        } else {
          // Transação única agendada - salva em incoming_transactions
          const incomingTransactionData = {
            user_id: user.id,
            workspace_id: workspaceId,
            type,
            amount: parseFloat(amount),
            category,
            description,
            expected_date: format(expectedDate, 'yyyy-MM-dd'),
            status: 'pending'
          };

          const { error } = await supabase
            .from('incoming_transactions')
            .insert([incomingTransactionData]);

          if (error) throw error;

          toast({
            title: "Sucesso!",
            description: "Transação agendada com sucesso!",
            action: <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Agendada</Badge>
          });
        }
      }

      if (onSuccess) onSuccess();
      
      // Limpar formulário se não for edição
      if (!transaction) {
        setAmount('');
        setCategory('');
        setDescription('');
        setDate(new Date());
        setExpectedDate(new Date());
        setIsRecurring(false);
      }

    } catch (error) {
      console.error('Error saving transaction:', error);
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
        "border-0 shadow-none bg-card",
        isMobile ? "rounded-none" : "rounded-xl"
      )}>
        <CardHeader className={cn(
          isMobile ? "px-0 pt-0 pb-3" : "px-2 sm:px-6"
        )}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn(
              "text-lg sm:text-xl",
              isMobile && "text-base"
            )}>
              {transaction ? 'Editar Transação' : 'Nova Transação'}
            </CardTitle>
            {limits && (
              <Badge variant="outline" className="flex items-center gap-1">
                {limits.plan === 'free' && <span className="text-xs">FREE</span>}
                {limits.plan === 'pro' && <><Crown className="w-3 h-3" />PRO</>}
                {limits.plan === 'business' && <><Crown className="w-3 h-3" />BUSINESS</>}
              </Badge>
            )}
          </div>
          {current && (
            <p className="text-sm text-muted-foreground">
              Workspace: {current.name}
            </p>
          )}
        </CardHeader>

        <CardContent className={cn(
          isMobile ? "px-0" : "px-2 sm:px-6"
        )}>
          {/* Tabs para escolher modo (apenas se não for edição) */}
          {!transaction && (
            <Tabs value={mode} onValueChange={handleModeChange} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="immediate" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Adicionar Agora
                </TabsTrigger>
                <TabsTrigger 
                  value="scheduled" 
                  className="flex items-center gap-2"
                  disabled={!canUseFeature('scheduling')}
                >
                  <Calendar className="w-4 h-4" />
                  Agendar
                  {!canUseFeature('scheduling') && <Crown className="w-3 h-3 text-amber-500" />}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <form onSubmit={handleSubmit} className={cn(
            "space-y-4",
            isMobile && "pb-2"
          )}>
            <TransactionFieldsGroup
              type={type} setType={setType}
              amount={amount} setAmount={setAmount}
              category={category} setCategory={setCategory}
              date={mode === 'immediate' ? date : expectedDate} 
              setDate={mode === 'immediate' ? setDate : setExpectedDate}
              description={description} setDescription={setDescription}
              isRecurring={isRecurring} 
              setIsRecurring={handleRecurringChange}
              recurrencePattern={recurrencePattern} 
              setRecurrencePattern={setRecurrencePattern}
              recurrenceEndDate={recurrenceEndDate} 
              setRecurrenceEndDate={setRecurrenceEndDate}
              isMobile={isMobile}
              isScheduled={false}
              canUseRecurring={canUseFeature('recurring')}
            />

            {/* Informações sobre limites do plano */}
            {limits && limits.plan === 'free' && (
              <div className="p-3 bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
                  <Crown className="w-4 h-4" />
                  <span className="font-medium">Plano Gratuito</span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Você pode criar até {limits.transactions} transações por mês. 
                  {mode === 'scheduled' && ' Agendamento disponível apenas nos planos pagos.'}
                </p>
              </div>
            )}

            {/* Botões de ação */}
            <div className={cn(
              "flex flex-col sm:flex-row gap-3 pt-4",
              isMobile && "space-y-2 sm:space-y-0"
            )}>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className={cn("h-12", isMobile && "text-base")}
                >
                  Cancelar
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={loading}
                className={cn("flex-1 h-12", isMobile && "text-base")}
              >
                {loading ? 'Salvando...' : 
                 transaction ? 'Atualizar' : 
                 mode === 'immediate' ? 'Adicionar Transação' : 'Agendar Transação'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}