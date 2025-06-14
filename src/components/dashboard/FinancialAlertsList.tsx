
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const alerts = [
  {
    area: "Orçamento",
    detail: "Você ultrapassou seu orçamento em Lazer em 15%."
  },
  {
    area: "Meta",
    detail: "Faltam 7 dias para sua meta 'Viagem à Europa'!"
  },
  {
    area: "Pagamento",
    detail: "Sua assinatura PRO foi renovada com sucesso."
  },
];

export function FinancialAlertsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-attention">
          <AlertTriangle className="w-5 h-5" /> Alertas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {alerts.map((alert, i) => (
          <div key={i} className="">
            <span className="font-bold">{alert.area}:</span> {alert.detail}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
