
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";

type Goal = Tables<'financial_goals'>;

interface GoalDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}

const getPriorityLabel = (priority: string | null) => {
  switch (priority) {
    case "high": return "Alta";
    case "medium": return "Média";
    case "low": return "Baixa";
    default: return "Média";
  }
};

export function GoalDetailsModal({ open, onOpenChange, goal }: GoalDetailsModalProps) {
  if (!goal) return null;
  const currentAmount = goal.current_amount || 0;
  const targetAmount = goal.target_amount || 0;
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const isCompleted = progress >= 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Meta</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="font-display text-2xl font-bold mb-1">{goal.name}</div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default">{getPriorityLabel(goal.priority)}</Badge>
            {isCompleted && <Badge className="bg-green-500">Concluída!</Badge>}
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-2" />
          </div>

          <div className="flex justify-between mt-2">
            <div>
              <div className="text-xs text-muted-foreground">Atual</div>
              <div className="font-bold text-green-600">
                R$ {currentAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Meta</div>
              <div className="font-bold">
                R$ {targetAmount.toFixed(2).replace('.', ',')}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Faltam</div>
              <div className="font-bold text-orange-600">
                R$ {Math.max(0, targetAmount - currentAmount).toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>
          {goal.target_date && (
            <div className="text-xs mt-2 text-muted-foreground">
              Data limite: {format(new Date(goal.target_date), "dd/MM/yyyy", { locale: ptBR })}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            Criada em: {goal.created_at ? format(new Date(goal.created_at), "dd/MM/yyyy", { locale: ptBR }) : "--"}
          </div>
          <div className="text-xs text-muted-foreground">
            Última atualização: {goal.updated_at ? format(new Date(goal.updated_at), "dd/MM/yyyy", { locale: ptBR }) : "--"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
