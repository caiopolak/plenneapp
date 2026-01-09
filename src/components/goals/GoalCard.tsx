import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Edit2, Trash2, TrendingUp, Eye, Target, Calendar,
  AlertTriangle, Star, CheckCircle2, Flame
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";
import { GoalSparkline } from "./GoalSparkline";
import { cn } from "@/lib/utils";

type Goal = Tables<'financial_goals'>;

interface GoalCardProps {
  goal: Goal;
  index: number;
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddValue: () => void;
}

const getPriorityConfig = (priority: string | null) => {
  switch (priority) {
    case "high": 
      return { label: "Alta", variant: "destructive" as const, icon: AlertTriangle, color: "text-destructive" };
    case "medium": 
      return { label: "Média", variant: "default" as const, icon: Star, color: "text-amber-500" };
    case "low": 
      return { label: "Baixa", variant: "secondary" as const, icon: CheckCircle2, color: "text-muted-foreground" };
    default: 
      return { label: "Média", variant: "default" as const, icon: Star, color: "text-amber-500" };
  }
};

const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("casa") || lowerName.includes("imóvel") || lowerName.includes("apartamento")) return "🏠";
  if (lowerName.includes("carro") || lowerName.includes("veículo") || lowerName.includes("moto")) return "🚗";
  if (lowerName.includes("viagem") || lowerName.includes("férias")) return "✈️";
  if (lowerName.includes("emergência") || lowerName.includes("reserva")) return "🛡️";
  if (lowerName.includes("estudo") || lowerName.includes("curso") || lowerName.includes("faculdade")) return "📚";
  if (lowerName.includes("casamento")) return "💒";
  if (lowerName.includes("aposentadoria")) return "🏖️";
  if (lowerName.includes("investimento")) return "📈";
  if (lowerName.includes("reforma")) return "🔨";
  if (lowerName.includes("filho") || lowerName.includes("bebê")) return "👶";
  return "🎯";
};

export function GoalCard({ goal, index, onDetails, onEdit, onDelete, onAddValue }: GoalCardProps) {
  const currentAmount = goal.current_amount || 0;
  const targetAmount = goal.target_amount || 0;
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const isCompleted = progress >= 100;
  const remaining = Math.max(0, targetAmount - currentAmount);
  const priorityConfig = getPriorityConfig(goal.priority);
  const PriorityIcon = priorityConfig.icon;
  const categoryIcon = getCategoryIcon(goal.name);

  // Days remaining calculation
  const daysRemaining = goal.target_date 
    ? differenceInDays(new Date(goal.target_date), new Date())
    : null;
  const isUrgent = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  // Monthly savings needed
  const monthsRemaining = daysRemaining ? Math.max(1, Math.ceil(daysRemaining / 30)) : null;
  const monthlySavingsNeeded = monthsRemaining && remaining > 0 
    ? remaining / monthsRemaining 
    : null;

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in opacity-0",
        isCompleted && "ring-2 ring-secondary/50 bg-gradient-to-br from-secondary/5 to-secondary/10",
        isUrgent && !isCompleted && "ring-1 ring-amber-500/50",
        isOverdue && !isCompleted && "ring-1 ring-destructive/50"
      )}
      style={{ 
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {/* Priority Indicator Strip */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full",
        goal.priority === "high" && "bg-destructive",
        goal.priority === "medium" && "bg-amber-500",
        goal.priority === "low" && "bg-muted-foreground/30"
      )} />

      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon + Name + Badges */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform hover:scale-110",
              isCompleted 
                ? "bg-secondary/20"
                : "bg-primary/10"
            )}>
              {categoryIcon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base text-foreground truncate">
                {goal.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <Badge variant={priorityConfig.variant} className="text-[10px] gap-0.5 h-5">
                  <PriorityIcon className="h-3 w-3" />
                  {priorityConfig.label}
                </Badge>
                {isCompleted && (
                  <Badge className="bg-secondary text-secondary-foreground text-[10px] h-5 gap-0.5">
                    <CheckCircle2 className="h-3 w-3" />
                    Concluída!
                  </Badge>
                )}
                {isUrgent && !isCompleted && (
                  <Badge variant="outline" className="text-[10px] h-5 gap-0.5 border-amber-500/50 text-amber-600">
                    <Flame className="h-3 w-3" />
                    {daysRemaining}d
                  </Badge>
                )}
                {isOverdue && !isCompleted && (
                  <Badge variant="destructive" className="text-[10px] h-5 gap-0.5">
                    <AlertTriangle className="h-3 w-3" />
                    Atrasada
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right: Sparkline */}
          <GoalSparkline goalId={goal.id} className="hidden sm:block" />
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        {/* Progress Section */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-muted-foreground">Progresso</span>
            <span className={cn(
              "text-sm font-bold",
              isCompleted ? "text-secondary" : progress >= 75 ? "text-primary" : "text-foreground"
            )}>
              {progress.toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={Math.min(progress, 100)} 
            className={cn(
              "h-2.5",
              isCompleted && "[&>div]:bg-secondary",
              progress >= 75 && !isCompleted && "[&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-secondary"
            )}
          />
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-lg bg-secondary/10 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Atual</div>
            <div className="font-bold text-secondary text-sm mt-0.5">
              R$ {formatCurrency(currentAmount)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Meta</div>
            <div className="font-bold text-primary text-sm mt-0.5">
              R$ {formatCurrency(targetAmount)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/50 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Faltam</div>
            <div className="font-bold text-foreground text-sm mt-0.5">
              R$ {formatCurrency(remaining)}
            </div>
          </div>
        </div>

        {/* Extra Info Row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {goal.target_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Prazo: {format(new Date(goal.target_date), "dd/MM/yy", { locale: ptBR })}</span>
            </div>
          )}
          {monthlySavingsNeeded && !isCompleted && (
            <div className="flex items-center gap-1 text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="font-medium">R$ {formatCurrency(monthlySavingsNeeded)}/mês</span>
            </div>
          )}
        </div>

        {/* Note Preview */}
        {goal.note && (
          <div className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded-md line-clamp-1">
            📝 {goal.note}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs gap-1.5"
            onClick={onDetails}
          >
            <Eye className="h-3.5 w-3.5" />
            Detalhes
          </Button>
          {!isCompleted && (
            <Button
              size="sm"
              className="flex-1 h-9 text-xs gap-1.5"
              onClick={onAddValue}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
