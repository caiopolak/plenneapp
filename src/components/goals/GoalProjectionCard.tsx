import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Calendar, AlertTriangle, Target, Sparkles } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number | null;
  target_date: string | null;
  created_at: string | null;
  priority: string | null;
}

interface GoalProjectionCardProps {
  goals: Goal[];
}

interface GoalProjection {
  goal: Goal;
  progress: number;
  daysRemaining: number | null;
  monthlyRate: number;
  projectedDate: Date | null;
  willMeetDeadline: boolean | null;
  status: "on_track" | "at_risk" | "behind" | "completed" | "no_deadline";
  daysToComplete: number | null;
}

function calculateProjections(goals: Goal[]): GoalProjection[] {
  return goals.map((goal) => {
    const currentAmount = goal.current_amount || 0;
    const targetAmount = goal.target_amount || 0;
    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    const remaining = Math.max(0, targetAmount - currentAmount);

    // Calculate monthly savings rate based on history
    const createdAt = goal.created_at ? new Date(goal.created_at) : new Date();
    const daysSinceCreation = Math.max(1, differenceInDays(new Date(), createdAt));
    const dailyRate = currentAmount / daysSinceCreation;
    const monthlyRate = dailyRate * 30;

    let daysRemaining: number | null = null;
    let projectedDate: Date | null = null;
    let willMeetDeadline: boolean | null = null;
    let status: GoalProjection["status"] = "no_deadline";
    let daysToComplete: number | null = null;

    if (progress >= 100) {
      status = "completed";
    } else if (goal.target_date) {
      const targetDate = new Date(goal.target_date);
      daysRemaining = differenceInDays(targetDate, new Date());

      if (dailyRate > 0) {
        daysToComplete = Math.ceil(remaining / dailyRate);
        projectedDate = addDays(new Date(), daysToComplete);
        willMeetDeadline = daysToComplete <= daysRemaining;

        if (willMeetDeadline) {
          // Check if close to on track
          const buffer = daysRemaining * 0.2; // 20% buffer
          if (daysToComplete <= daysRemaining - buffer) {
            status = "on_track";
          } else {
            status = "at_risk";
          }
        } else {
          status = "behind";
        }
      } else {
        status = "behind";
        daysToComplete = null;
        projectedDate = null;
        willMeetDeadline = false;
      }
    } else if (dailyRate > 0 && remaining > 0) {
      daysToComplete = Math.ceil(remaining / dailyRate);
      projectedDate = addDays(new Date(), daysToComplete);
      status = "on_track";
    }

    return {
      goal,
      progress,
      daysRemaining,
      monthlyRate,
      projectedDate,
      willMeetDeadline,
      status,
      daysToComplete,
    };
  });
}

function getStatusBadge(status: GoalProjection["status"]) {
  switch (status) {
    case "completed":
      return <Badge className="bg-secondary text-secondary-foreground">Concluída</Badge>;
    case "on_track":
      return <Badge className="bg-primary text-primary-foreground">No caminho</Badge>;
    case "at_risk":
      return <Badge variant="outline" className="border-accent text-accent">Em risco</Badge>;
    case "behind":
      return <Badge variant="destructive">Atrasada</Badge>;
    default:
      return <Badge variant="secondary">Sem prazo</Badge>;
  }
}

function getStatusIcon(status: GoalProjection["status"]) {
  switch (status) {
    case "completed":
      return <Target className="w-5 h-5 text-secondary" />;
    case "on_track":
      return <TrendingUp className="w-5 h-5 text-primary" />;
    case "at_risk":
      return <AlertTriangle className="w-5 h-5 text-accent" />;
    case "behind":
      return <AlertTriangle className="w-5 h-5 text-destructive" />;
    default:
      return <Calendar className="w-5 h-5 text-muted-foreground" />;
  }
}

export function GoalProjectionCard({ goals }: GoalProjectionCardProps) {
  const activeGoals = goals.filter((g) => {
    const progress = g.target_amount > 0 ? ((g.current_amount || 0) / g.target_amount) * 100 : 0;
    return progress < 100;
  });

  const projections = calculateProjections(activeGoals);

  // Sort by priority: behind > at_risk > on_track > no_deadline
  const sortedProjections = projections.sort((a, b) => {
    const order = { behind: 0, at_risk: 1, on_track: 2, no_deadline: 3, completed: 4 };
    return order[a.status] - order[b.status];
  });

  const atRiskCount = projections.filter((p) => p.status === "at_risk" || p.status === "behind").length;

  if (activeGoals.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            <CardTitle className="text-lg font-display">Projeções Inteligentes</CardTitle>
          </div>
          {atRiskCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {atRiskCount} {atRiskCount === 1 ? "meta em risco" : "metas em risco"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedProjections.slice(0, 5).map((projection) => (
          <div
            key={projection.goal.id}
            className="p-3 rounded-lg bg-muted/50 border border-border space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(projection.status)}
                <span className="font-medium text-foreground">{projection.goal.name}</span>
              </div>
              {getStatusBadge(projection.status)}
            </div>

            <Progress value={Math.min(projection.progress, 100)} className="h-2" />

            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  R$ {(projection.goal.current_amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  {" / "}
                  R$ {projection.goal.target_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-primary font-medium">{projection.progress.toFixed(0)}%</span>
              </div>

              <div className="text-right">
                {projection.status !== "completed" && projection.monthlyRate > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Ritmo: R$ {projection.monthlyRate.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mês
                  </div>
                )}
              </div>
            </div>

            {projection.status !== "completed" && projection.status !== "no_deadline" && (
              <div className="flex flex-wrap items-center justify-between text-xs gap-2 pt-1 border-t border-border/50">
                {projection.goal.target_date && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Prazo: {format(new Date(projection.goal.target_date), "dd/MM/yyyy", { locale: ptBR })}
                    {projection.daysRemaining !== null && projection.daysRemaining >= 0 && (
                      <span className="ml-1">({projection.daysRemaining} dias)</span>
                    )}
                  </div>
                )}
                {projection.projectedDate && (
                  <div
                    className={`flex items-center gap-1 ${
                      projection.willMeetDeadline ? "text-secondary" : "text-destructive"
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    Previsão: {format(projection.projectedDate, "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                )}
              </div>
            )}

            {projection.status === "no_deadline" && projection.projectedDate && (
              <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Previsão de conclusão: {format(projection.projectedDate, "dd/MM/yyyy", { locale: ptBR })}
              </div>
            )}
          </div>
        ))}

        {sortedProjections.length > 5 && (
          <p className="text-xs text-muted-foreground text-center">
            + {sortedProjections.length - 5} metas adicionais
          </p>
        )}
      </CardContent>
    </Card>
  );
}
