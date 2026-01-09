import React from "react";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalMilestonesProps {
  progress: number;
  targetAmount: number;
  currentAmount: number;
}

const milestones = [
  { percent: 25, label: "25%", icon: "🌱", message: "Ótimo começo!" },
  { percent: 50, label: "50%", icon: "🔥", message: "Metade do caminho!" },
  { percent: 75, label: "75%", icon: "🚀", message: "Quase lá!" },
  { percent: 100, label: "100%", icon: "🎉", message: "Meta alcançada!" }
];

export function GoalMilestones({ progress, targetAmount, currentAmount }: GoalMilestonesProps) {
  const getNextMilestone = () => {
    for (const m of milestones) {
      if (progress < m.percent) return m;
    }
    return milestones[milestones.length - 1];
  };

  const nextMilestone = getNextMilestone();
  const nextMilestoneAmount = (nextMilestone.percent / 100) * targetAmount;
  const amountToNext = Math.max(0, nextMilestoneAmount - currentAmount);

  return (
    <div className="space-y-4">
      {/* Milestone Progress Bar */}
      <div className="relative">
        <div className="flex justify-between items-center mb-2">
          {milestones.map((milestone, index) => {
            const isCompleted = progress >= milestone.percent;
            const isCurrent = progress < milestone.percent && (index === 0 || progress >= milestones[index - 1].percent);
            
            return (
              <div
                key={milestone.percent}
                className={cn(
                  "flex flex-col items-center transition-all duration-300",
                  isCompleted ? "scale-110" : ""
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500",
                    isCompleted 
                      ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30" 
                      : isCurrent
                        ? "bg-primary/20 text-primary border-2 border-primary animate-pulse"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <span className="animate-pop">{milestone.icon}</span>
                  ) : (
                    <span className="text-sm font-bold">{milestone.label}</span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] mt-1 font-medium",
                  isCompleted ? "text-secondary" : "text-muted-foreground"
                )}>
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted -z-10">
          <div 
            className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Next Milestone Card */}
      {progress < 100 && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{nextMilestone.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Próximo marco: {nextMilestone.label}
              </p>
              <p className="text-xs text-muted-foreground">
                Faltam <span className="font-semibold text-primary">
                  R$ {amountToNext.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span> para {nextMilestone.message.toLowerCase()}
              </p>
            </div>
            <Star className="h-5 w-5 text-amber-500" />
          </div>
        </div>
      )}

      {/* Completed State */}
      {progress >= 100 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-secondary/20 to-emerald-500/20 border border-secondary/30">
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-float">🎉</div>
            <div>
              <p className="text-sm font-bold text-secondary">Parabéns!</p>
              <p className="text-xs text-muted-foreground">
                Você alcançou 100% da sua meta. Continue assim!
              </p>
            </div>
            <Check className="h-6 w-6 text-secondary" />
          </div>
        </div>
      )}
    </div>
  );
}
