
import React from "react";

interface FinancialAlertsCardProps {
  balance: number;
  totalGoals: number;
}

export function FinancialAlertsCard({ balance, totalGoals }: FinancialAlertsCardProps) {
  return (
    <div className="bg-gradient-to-bl from-[#e8f3f1] to-[#FFFDF0] border border-blue-200 rounded-xl shadow px-6 py-5">
      <div className="flex items-center gap-2">
        {balance < 0 ? (
          <span className="bg-red-100 rounded-full p-2 mr-2">
            <svg width="25" height="25">
              <circle cx="12" cy="12" r="12" fill="#fee2e2"/>
              <text x="12" y="18" fontSize="16" textAnchor="middle" fill="#ef4444">!</text>
            </svg>
          </span>
        ) : (
          <span className="bg-green-100 rounded-full p-2 mr-2">
            <svg width="25" height="25">
              <circle cx="12" cy="12" r="12" fill="#d1fae5"/>
              <text x="12" y="18" fontSize="16" textAnchor="middle" fill="#22c55e">✓</text>
            </svg>
          </span>
        )}
        <span className={`font-semibold ${balance < 0 ? "text-red-700" : "text-green-700"} text-base`}>
          {balance < 0 ? "Alerta Finanzas" : "Parabéns!"}
        </span>
      </div>
      <div className={`mt-2 text-sm ${balance < 0 ? "text-red-700 font-medium" : "text-green-800"}`}>
        {balance < 0
          ? "Seus gastos superaram as receitas. Reveja despesas e ajuste sua rota!"
          : "Ótimo! Seu saldo está positivo este mês. Avalie investir o excedente para crescer ainda mais 🚀"}
      </div>
      {totalGoals === 0 && (
        <div className="mt-4 p-3 rounded-md bg-orange-50 border border-orange-200 flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="text-orange-700 font-semibold">
            Crie sua primeira meta financeira e conquiste seu próximo objetivo!
          </span>
        </div>
      )}
    </div>
  );
}
