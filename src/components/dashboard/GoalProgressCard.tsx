import React from "react";
import { GoalsProgressBar } from "./GoalsProgressBar";

interface GoalProgressCardProps {
  completedGoals: number;
  totalGoals: number;
  goalsProgress: number;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({
  completedGoals,
  totalGoals,
  goalsProgress,
}) => {
  let stateLabel;
  const stateClass =
    "inline-block rounded px-3 py-1 text-xs font-bold";

  if (goalsProgress === 100 && totalGoals > 0) {
    stateLabel = (
      <span className={`${stateClass} bg-green-100 text-green-900 animate-pulse`}>Tudo concluído! 🏅</span>
    );
  } else if (goalsProgress >= 70 && goalsProgress < 100) {
    stateLabel = (
      <span className={`${stateClass} bg-blue-100 text-blue-900`}>Quase lá!</span>
    );
  } else if (goalsProgress < 70 && totalGoals > 0) {
    stateLabel = (
      <span className={`${stateClass} bg-gray-100 text-gray-500`}>Continue focado</span>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow border border-border px-6 py-5 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl text-secondary">🎯</span>
        <span className="font-bold text-secondary">Progresso das Metas</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-xl font-bold text-graphite">{completedGoals} / {totalGoals} metas</div>
        {stateLabel}
      </div>
      <div className="mt-4 mb-1 w-full bg-green-50 rounded">
        <GoalsProgressBar goalsProgress={goalsProgress} />
      </div>
      <div className="text-xs mt-1 text-secondary">{goalsProgress.toFixed(0)}% das metas concluídas</div>
    </div>
  );
}
