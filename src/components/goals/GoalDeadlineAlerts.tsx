import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number | null;
  target_date: string | null;
  priority: string | null;
}

interface GoalDeadlineAlertsProps {
  goals: Goal[];
  onGoalClick?: (goalId: string) => void;
}

interface DeadlineAlert {
  goal: Goal;
  daysRemaining: number;
  progress: number;
  amountRemaining: number;
  dailyNeeded: number;
  severity: "critical" | "warning" | "info";
}

function getDeadlineAlerts(goals: Goal[]): DeadlineAlert[] {
  const now = new Date();
  const alerts: DeadlineAlert[] = [];

  goals.forEach((goal) => {
    if (!goal.target_date) return;

    const currentAmount = goal.current_amount || 0;
    const targetAmount = goal.target_amount || 0;
    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

    // Skip completed goals
    if (progress >= 100) return;

    const targetDate = new Date(goal.target_date);
    const daysRemaining = differenceInDays(targetDate, now);

    // Only show alerts for goals within 30 days or overdue
    if (daysRemaining > 30) return;

    const amountRemaining = targetAmount - currentAmount;
    const dailyNeeded = daysRemaining > 0 ? amountRemaining / daysRemaining : amountRemaining;

    let severity: DeadlineAlert["severity"] = "info";
    if (daysRemaining <= 0) {
      severity = "critical";
    } else if (daysRemaining <= 7) {
      severity = "critical";
    } else if (daysRemaining <= 14) {
      severity = "warning";
    }

    alerts.push({
      goal,
      daysRemaining,
      progress,
      amountRemaining,
      dailyNeeded,
      severity,
    });
  });

  // Sort by urgency (days remaining, then severity)
  return alerts.sort((a, b) => {
    if (a.daysRemaining !== b.daysRemaining) {
      return a.daysRemaining - b.daysRemaining;
    }
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function getSeverityStyles(severity: DeadlineAlert["severity"]) {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-destructive/10",
        border: "border-destructive/30",
        icon: "text-destructive",
        badge: "destructive" as const,
      };
    case "warning":
      return {
        bg: "bg-accent/10",
        border: "border-accent/30",
        icon: "text-accent",
        badge: "outline" as const,
      };
    default:
      return {
        bg: "bg-primary/10",
        border: "border-primary/30",
        icon: "text-primary",
        badge: "secondary" as const,
      };
  }
}

export function GoalDeadlineAlerts({ goals, onGoalClick }: GoalDeadlineAlertsProps) {
  const alerts = getDeadlineAlerts(goals);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-accent" />
          <CardTitle className="text-lg font-display">Alertas de Prazo</CardTitle>
          <Badge variant="destructive" className="ml-auto">
            {alerts.length} {alerts.length === 1 ? "alerta" : "alertas"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const styles = getSeverityStyles(alert.severity);

          return (
            <div
              key={alert.goal.id}
              className={`p-3 rounded-lg ${styles.bg} border ${styles.border} cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={() => onGoalClick?.(alert.goal.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${styles.icon}`} />
                    <span className="font-medium text-foreground">{alert.goal.name}</span>
                    <Badge variant={styles.badge}>
                      {alert.daysRemaining < 0
                        ? `${Math.abs(alert.daysRemaining)} dias atrasado`
                        : alert.daysRemaining === 0
                        ? "Vence hoje!"
                        : `${alert.daysRemaining} dias restantes`}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Progresso: <span className="text-foreground font-medium">{alert.progress.toFixed(0)}%</span>
                    </span>
                    <span>
                      Faltam:{" "}
                      <span className="text-foreground font-medium">
                        R$ {alert.amountRemaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </span>
                  </div>

                  {alert.daysRemaining > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <TrendingUp className="w-3 h-3 text-secondary" />
                      <span className="text-muted-foreground">
                        Para atingir: R${" "}
                        {alert.dailyNeeded.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        /dia
                      </span>
                    </div>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          );
        })}

        {alerts.filter((a) => a.severity === "critical").length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            ⚠️ Metas em vermelho precisam de atenção imediata
          </div>
        )}
      </CardContent>
    </Card>
  );
}
