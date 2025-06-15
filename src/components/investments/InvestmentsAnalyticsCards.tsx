
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Plus } from "lucide-react";

interface Props {
  totalInvested: number;
  totalInvestments: number;
  averageReturn: number;
}

export function InvestmentsAnalyticsCards({
  totalInvested,
  totalInvestments,
  averageReturn,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-tr from-[#003f5c] to-[#2f9e44] shadow-[0_4px_32px_0_rgba(0,63,92,0.16)] border-none">
        <CardContent className="p-6 flex flex-col items-start gap-2">
          <div className="text-sm text-white/90 font-medium flex items-center gap-2 font-display">
            <TrendingUp className="w-5 h-5 text-[#f4f4f4]" /> Total Investido
          </div>
          <div className="text-3xl font-extrabold text-white drop-shadow font-display">
            R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[#eaf6ee] shadow-[0_4px_32px_0_rgba(0,63,92,0.11)] border-0">
        <CardContent className="p-6 flex flex-col items-start gap-2">
          <div className="text-sm text-[#003f5c] font-medium flex items-center gap-2 font-display">
            <Plus className="w-5 h-5 text-[#2f9e44]" /> Nº Investimentos
          </div>
          <div className="text-3xl font-extrabold text-[#003f5c] drop-shadow font-display">
            {totalInvestments}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-tr from-[#003f5c]/80 to-[#2f9e44]/40 shadow-[0_4px_32px_0_rgba(0,63,92,0.14)] border-0">
        <CardContent className="p-6 flex flex-col items-start gap-2">
          <div className="text-sm text-white/90 font-medium flex items-center gap-2 font-display">
            <TrendingUp className="w-5 h-5 text-white/80" /> Retorno Médio Esperado
          </div>
          <div className="text-3xl font-extrabold text-white font-display">
            {averageReturn.toFixed(1)}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
