
import React from "react";

interface GoalsProgressBarProps {
  goalsProgress: number;
}

export function GoalsProgressBar({ goalsProgress }: GoalsProgressBarProps) {
  return (
    <div
      className="bg-yellow-400 h-2 rounded transition-all"
      style={{ width: `${goalsProgress}%`, minWidth: 12, maxWidth: "100%" }}
    />
  );
}
