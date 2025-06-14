
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Bulb } from "lucide-react";

// Dicas fixas por enquanto
const tips = [
  { type: "dica", text: "Automatize suas economias transferindo uma parte do salário assim que receber." },
  { type: "alerta", text: "Você está gastando mais de 30% do seu rendimento com Alimentação. Considere reduzir." },
  { type: "dica", text: "Considere investir pelo menos 10% da sua renda para construir riqueza a longo prazo." },
];

export function FinancialTipsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-attention">
          <Bulb className="w-5 h-5 text-attention" /> Dicas Financeiras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-2">
            {tip.type === "dica" ? (
              <Bulb className="w-4 h-4 mt-1 text-secondary" />
            ) : (
              <AlertTriangle className="w-4 h-4 mt-1 text-attention" />
            )}
            <span className="text-sm">
              <span className="font-bold capitalize">{tip.type}:</span> {tip.text}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
