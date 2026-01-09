import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";
import { GoalDepositsHistory } from "./GoalDepositsHistory";
import { GoalProgressChart } from "./GoalProgressChart";
import { GoalStatistics } from "./GoalStatistics";
import { GoalMilestones } from "./GoalMilestones";
import { 
  Target, Calendar, TrendingUp, BarChart3, History, 
  Star, AlertTriangle, CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";

type Goal = Tables<'financial_goals'>;

interface GoalDetailsModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onAddValue?: () => void;
  onRefresh?: () => void;
}

const getPriorityConfig = (priority: string | null) => {
  switch (priority) {
    case "high": 
      return { label: "Alta", color: "destructive", icon: AlertTriangle };
    case "medium": 
      return { label: "Média", color: "default", icon: Star };
    case "low": 
      return { label: "Baixa", color: "secondary", icon: CheckCircle2 };
    default: 
      return { label: "Média", color: "default", icon: Star };
  }
};

export function GoalDetailsModalEnhanced({ 
  open, 
  onOpenChange, 
  goal,
  onAddValue,
  onRefresh
}: GoalDetailsModalEnhancedProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!goal) return null;

  const currentAmount = goal.current_amount || 0;
  const targetAmount = goal.target_amount || 0;
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const isCompleted = progress >= 100;
  const remaining = Math.max(0, targetAmount - currentAmount);
  const priorityConfig = getPriorityConfig(goal.priority);
  const PriorityIcon = priorityConfig.icon;

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-primary shrink-0" />
                <span className="truncate">{goal.name}</span>
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={priorityConfig.color as any} className="gap-1">
                  <PriorityIcon className="h-3 w-3" />
                  {priorityConfig.label}
                </Badge>
                {isCompleted && (
                  <Badge className="bg-secondary text-secondary-foreground gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Concluída!
                  </Badge>
                )}
                {goal.target_date && (
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(goal.target_date), "dd/MM/yyyy", { locale: ptBR })}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Main Progress Card */}
        <div className={cn(
          "p-4 rounded-xl border mb-4",
          isCompleted 
            ? "bg-gradient-to-r from-secondary/20 to-emerald-500/20 border-secondary/30"
            : "bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20"
        )}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Progresso Geral</span>
            <span className={cn(
              "text-2xl font-bold",
              isCompleted ? "text-secondary" : progress >= 75 ? "text-primary" : "text-foreground"
            )}>
              {progress.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={Math.min(progress, 100)} 
            className={cn(
              "h-3 mb-3",
              isCompleted 
                ? "[&>div]:bg-secondary" 
                : progress >= 75 
                  ? "[&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-secondary"
                  : ""
            )}
          />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Atual</div>
              <div className="font-bold text-secondary text-lg">{formatCurrency(currentAmount)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Meta</div>
              <div className="font-bold text-primary text-lg">{formatCurrency(targetAmount)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Faltam</div>
              <div className="font-bold text-foreground text-lg">{formatCurrency(remaining)}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs sm:text-sm">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
              <span className="sm:hidden">Hist.</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Análises</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 pr-1">
            {/* Overview Tab */}
            <TabsContent value="overview" className="m-0 space-y-4">
              {/* Milestones */}
              <GoalMilestones 
                progress={progress} 
                targetAmount={targetAmount} 
                currentAmount={currentAmount} 
              />

              {/* Note */}
              {goal.note && (
                <div className="p-3 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">📝 Observações</p>
                  <p className="text-sm text-foreground">{goal.note}</p>
                </div>
              )}

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Criada em:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {goal.created_at 
                      ? format(new Date(goal.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : "—"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Última atualização:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {goal.updated_at 
                      ? format(new Date(goal.updated_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Add Value Button */}
              {!isCompleted && onAddValue && (
                <Button 
                  className="w-full gap-2 h-11"
                  onClick={() => {
                    onOpenChange(false);
                    onAddValue();
                  }}
                >
                  <TrendingUp className="h-4 w-4" />
                  Adicionar Aporte
                </Button>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="m-0 space-y-4">
              {/* Evolution Chart */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Evolução dos Aportes
                </h4>
                <GoalProgressChart goalId={goal.id} targetAmount={targetAmount} />
              </div>

              {/* Deposits History */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <GoalDepositsHistory 
                  goalId={goal.id} 
                  goalName={goal.name}
                  workspaceId={goal.workspace_id || undefined}
                  onDepositChange={onRefresh}
                />
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="m-0">
              <GoalStatistics
                goalId={goal.id}
                targetAmount={targetAmount}
                currentAmount={currentAmount}
                targetDate={goal.target_date}
                createdAt={goal.created_at}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
