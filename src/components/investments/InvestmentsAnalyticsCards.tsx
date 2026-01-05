import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Layers, Percent } from "lucide-react";

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
  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Total Investido */}
      <Card className="bg-gradient-to-br from-primary to-secondary shadow-lg border-none card-hover group sm:col-span-2 lg:col-span-1">
        <CardContent className="p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary-foreground/90 font-medium font-display">
              Total Investido
            </span>
            <div className="p-2 rounded-full bg-white/10 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-primary-foreground font-display truncate">
            R$ {formatCurrency(totalInvested)}
          </div>
          <p className="text-xs text-primary-foreground/70 hidden sm:block">
            Patrimônio total em investimentos
          </p>
        </CardContent>
      </Card>

      {/* Nº de Investimentos */}
      <Card className="bg-[hsl(var(--card-success-bg))] shadow-card border border-[hsl(var(--card-success-border))] card-hover group">
        <CardContent className="p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--card-success-text))] font-medium font-display">
              Nº de Ativos
            </span>
            <div className="p-2 rounded-full bg-[hsl(var(--card-success-accent))]/10 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--card-success-accent))]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--card-success-accent))] font-display">
            {totalInvestments}
          </div>
          <p className="text-xs text-[hsl(var(--card-success-text))]/70 hidden sm:block">
            Investimentos diversificados
          </p>
        </CardContent>
      </Card>

      {/* Retorno Médio */}
      <Card className="bg-[hsl(var(--card-info-bg))] shadow-card border border-[hsl(var(--card-info-border))] card-hover group">
        <CardContent className="p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[hsl(var(--card-info-text))] font-medium font-display">
              Retorno Médio
            </span>
            <div className="p-2 rounded-full bg-[hsl(var(--card-info-accent))]/10 group-hover:scale-110 transition-transform">
              <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--card-info-accent))]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--card-info-accent))] font-display">
            {averageReturn.toFixed(1)}%
          </div>
          <p className="text-xs text-[hsl(var(--card-info-text))]/70 hidden sm:block">
            Rentabilidade esperada ao ano
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
