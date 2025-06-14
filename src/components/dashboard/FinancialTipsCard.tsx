
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// "bulb" icon import fix as only the lowercase named icon is allowed.
import { icons } from "lucide-react";

// Dicas fixas por enquanto
const tips = [
  { type: "dica", text: "Automatize suas economias transferindo uma parte do salário assim que receber." },
  { type: "alerta", text: "Você está gastando mais de 30% do seu rendimento com Alimentação. Considere reduzir." },
  { type: "dica", text: "Considere investir pelo menos 10% da sua renda para construir riqueza a longo prazo." },
];

export function FinancialTipsCard() {
  const Bulb = icons["bulb"];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-attention">
          {/* Use bulb icon dynamically */}
          {Bulb ? <Bulb className="w-5 h-5 text-attention" /> : null} Dicas Financeiras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tips.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-2">
            {tip.type === "dica" ? (
              Bulb ? <Bulb className="w-4 h-4 mt-1 text-secondary" /> : null
            ) : (
              <svg className="w-4 h-4 mt-1 text-attention" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /></svg>
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
