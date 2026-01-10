import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { WorkspaceSelect } from "../common/WorkspaceSelect";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useConfetti } from '@/hooks/useConfetti';
import { goalSchema, validateInput, isValidationError, requireAuth, requireWorkspace } from '@/lib/validation';
import { checkRateLimit } from '@/lib/security';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { UpgradeCTA } from '@/components/subscription/UpgradeCTA';
import { Crown, Target } from 'lucide-react';

import { GoalNameField } from './fields/GoalNameField';
import { GoalAmountsFields } from './fields/GoalAmountsFields';
import { GoalDateAndPriorityFields } from './fields/GoalDateAndPriorityFields';
import { GoalNoteField } from './fields/GoalNoteField';

interface GoalFormProps {
  onSuccess?: () => void;
  goal?: any;
  onCancel?: () => void;
}

// Campos padronizados: value, onChange! (igual aos outros módulos)
export function GoalForm({ onSuccess, goal, onCancel }: GoalFormProps) {
  const [name, setName] = useState(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(goal?.target_amount || '');
  const [currentAmount, setCurrentAmount] = useState(goal?.current_amount || '');
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    goal?.target_date ? new Date(goal.target_date) : undefined
  );
  const [priority, setPriority] = useState(goal?.priority || 'medium');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(goal?.note || '');

  const { toast } = useToast();
  const { user } = useAuth();
  const { current, workspaces } = useWorkspace();
  const isMobile = useIsMobile();
  const { fireGoalComplete } = useConfetti();
  const { limits, checkLimit } = useSubscriptionLimits();
  
  const [workspaceId, setWorkspaceId] = useState(
    goal?.workspace_id ?? current?.id ?? (workspaces.length === 1 ? workspaces[0].id : "")
  );
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (!workspaceId && current?.id) setWorkspaceId(current.id);
  }, [current?.id, workspaceId]);

  // Verificar limite ao abrir formulário para nova meta
  useEffect(() => {
    const checkGoalLimit = async () => {
      if (!goal && user) {
        const canCreate = await checkLimit('goals');
        setLimitReached(!canCreate);
      }
    };
    checkGoalLimit();
  }, [goal, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting check
    if (!checkRateLimit(`goal_submit_${user?.id}`, 5, 60000)) {
      toast({
        variant: "destructive",
        title: "Muitas tentativas",
        description: "Aguarde um momento antes de tentar novamente"
      });
      return;
    }

    // Authentication and workspace validation
    try {
      requireAuth(user?.id);
      requireWorkspace(workspaceId);
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário ou workspace não identificado"
      });
      return;
    }

    // Input validation using Zod schema
    const validationResult = validateInput(goalSchema, {
      name,
      target_amount: targetAmount,
      current_amount: currentAmount || '0',
      target_date: targetDate ? targetDate.toISOString().split("T")[0] : undefined,
      priority,
      note: note || undefined
    });

    if (isValidationError(validationResult)) {
      toast({
        variant: "destructive",
        title: "Dados inválidos",
        description: validationResult.errors[0]
      });
      return;
    }

    setLoading(true);

    try {
      const validated = validationResult.data;
      const targetDateStr = validated.target_date 
        ? (typeof validated.target_date === 'string' ? validated.target_date : validated.target_date.toISOString().split('T')[0])
        : null;
      const goalData = {
        user_id: user!.id,
        workspace_id: workspaceId,
        name: validated.name,
        target_amount: Number(validated.target_amount),
        current_amount: Number(validated.current_amount),
        target_date: targetDateStr,
        priority: validated.priority,
        note: validated.note || null
      };

      if (goal) {
        const { error } = await supabase
          .from('financial_goals')
          .update(goalData)
          .eq('id', goal.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Meta atualizada com sucesso"
        });

        // Check if goal was just completed
        const wasCompleted = goal?.current_amount < goal?.target_amount;
        const isNowCompleted = (parseFloat(currentAmount) || 0) >= parseFloat(targetAmount);
        if (wasCompleted && isNowCompleted) {
          fireGoalComplete();
        }
      } else {
        const { error } = await supabase
          .from('financial_goals')
          .insert([goalData]);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Meta criada com sucesso"
        });
      }

      if (onSuccess) onSuccess();

      if (!goal) {
        setName('');
        setTargetAmount('');
        setCurrentAmount('');
        setTargetDate(undefined);
        setPriority('medium');
        setWorkspaceId(current?.id ?? "");
        setNote('');
      }

    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao salvar meta"
      });
    } finally {
      setLoading(false);
    }
  };

  // Se limite foi atingido, mostrar CTA de upgrade
  if (limitReached && !goal) {
    return (
      <div className={cn("w-full", isMobile && "px-2")}>
        <Card className={cn("border-0 shadow-none bg-card", isMobile ? "rounded-none" : "rounded-xl")}>
          <CardHeader className={cn(isMobile ? "px-0 pt-0 pb-3" : "px-2 sm:px-6")}>
            <CardTitle className={cn("text-lg sm:text-xl text-foreground flex items-center gap-2", isMobile && "text-base")}>
              <Target className="h-5 w-5 text-primary" />
              Limite de Metas Atingido
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(isMobile ? "px-0" : "px-2 sm:px-6")}>
            <UpgradeCTA 
              feature="Criar Mais Metas"
              description={`Você atingiu o limite de ${limits?.goals} metas do plano gratuito. Faça upgrade para criar metas ilimitadas e alcançar todos os seus objetivos!`}
              requiredPlan="pro"
              variant="modal"
            />
            {onCancel && (
              <div className="flex justify-center mt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Voltar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("w-full", isMobile && "px-2")}>
      <Card className={cn("border-0 shadow-none bg-card", isMobile ? "rounded-none" : "rounded-xl")}>
        <CardHeader className={cn(isMobile ? "px-0 pt-0 pb-3" : "px-2 sm:px-6")}>
          <div className="flex items-center justify-between">
            <CardTitle className={cn("text-lg sm:text-xl text-foreground", isMobile && "text-base")}>
              {goal ? 'Editar Meta' : 'Nova Meta Financeira'}
            </CardTitle>
            {limits && (
              <Badge variant="outline" className="flex items-center gap-1">
                {limits.plan === 'free' && <span className="text-xs">FREE</span>}
                {limits.plan === 'pro' && <><Crown className="w-3 h-3" />PRO</>}
                {limits.plan === 'business' && <><Crown className="w-3 h-3" />BUSINESS</>}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className={cn(isMobile ? "px-0" : "px-2 sm:px-6")}>
          {/* Alerta de limite próximo */}
          {limits && limits.plan === 'free' && !goal && (
            <div className="mb-4 p-3 bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
                <Crown className="w-4 h-4" />
                <span className="font-medium">Plano Gratuito</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Você pode criar até {limits.goals} metas. Faça upgrade para metas ilimitadas!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={cn("space-y-4", isMobile && "pb-2")}>
            <WorkspaceSelect
              value={workspaceId}
              onChange={setWorkspaceId}
              label="Workspace"
              disabled={workspaces.length <= 1}
            />
            <GoalNameField name={name} setName={setName} />
            <GoalAmountsFields
              targetAmount={targetAmount}
              setTargetAmount={setTargetAmount}
              currentAmount={currentAmount}
              setCurrentAmount={setCurrentAmount}
            />
            <GoalDateAndPriorityFields
              targetDate={targetDate}
              setTargetDate={setTargetDate}
              priority={priority}
              setPriority={setPriority}
            />
            <GoalNoteField note={note} setNote={setNote} />
            <div className={cn("flex flex-col-reverse sm:flex-row gap-2 pt-4", isMobile && "space-y-2 sm:space-y-0")}>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className={cn("h-10", isMobile && "text-base")}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={loading} className={cn("flex-1 h-10", isMobile && "text-base")}>
                {loading ? 'Salvando...' : (goal ? 'Atualizar' : 'Criar Meta')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
