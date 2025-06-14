
import React from "react";
import { GoalsProgressBar } from "./GoalsProgressBar";

interface GoalProgressCardProps {
  completedGoals: number;
  totalGoals: number;
  goalsProgress: number;
}

export function GoalProgressCard({
  completedGoals,
  totalGoals,
  goalsProgress,
}: GoalProgressCardProps) {
  let stateLabel;
  let stateClass =
    "inline-block rounded px-3 py-1 text-xs font-bold";

  if (goalsProgress === 100 && totalGoals > 0) {
    stateLabel = (
      <span className={`${stateClass} bg-green-200 text-green-900 animate-pulse`}>Tudo concluído! 🏅</span>
    );
  } else if (goalsProgress >= 70 && goalsProgress < 100) {
    stateLabel = (
      <span className={`${stateClass} bg-yellow-100 text-yellow-800`}>Quase lá!</span>
    );
  } else if (goalsProgress < 70 && totalGoals > 0) {
    stateLabel = (
      <span className={`${stateClass} bg-gray-100 text-gray-500`}>Continue focado</span>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-yellow-200 px-6 py-5 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🎯</span>
        <span className="font-bold text-yellow-700">Progresso das Metas</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-xl font-bold">{completedGoals} / {totalGoals} metas</div>
        {stateLabel}
      </div>
      <div className="mt-4 mb-1 w-full bg-gray-100 rounded">
        <GoalsProgressBar goalsProgress={goalsProgress} />
      </div>
      <div className="text-xs mt-1 text-yellow-900">{goalsProgress.toFixed(0)}% das metas concluídas</div>
    </div>
  );
}
