import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart3,
  PiggyBank,
  Percent,
} from "lucide-react";
import { format, differenceInMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  expected_return: number;
  purchase_date: string;
}

interface InvestmentProfitabilityAnalysisProps {
  investments: Investment[];
}

interface ProfitabilityData {
  investment: Investment;
  monthsHeld: number;
  annualizedReturn: number;
  projectedValue12m: number;
  projectedGain12m: number;
  performance: "excellent" | "good" | "average" | "poor";
  typeLabel: string;
}

const TYPE_LABELS: Record<string, string> = {
  stocks: "Ações",
  bonds: "Títulos",
  crypto: "Criptomoedas",
  real_estate: "Imóveis",
  funds: "Fundos",
  savings: "Poupança",
};

const BENCHMARK_RETURNS: Record<string, number> = {
  stocks: 12, // Expected ~12% for stocks
  bonds: 10, // CDI benchmark
  crypto: 20, // Higher risk/return
  real_estate: 8, // Real estate funds
  funds: 10, // Mixed funds
  savings: 6, // Savings account
};

function analyzeProfitability(investments: Investment[]): ProfitabilityData[] {
  return investments.map((investment) => {
    const purchaseDate = new Date(investment.purchase_date);
    const monthsHeld = Math.max(1, differenceInMonths(new Date(), purchaseDate));
    const expectedReturn = investment.expected_return || 0;
    const annualizedReturn = expectedReturn; // Already annual rate

    // Project 12 month value
    const projectedValue12m = investment.amount * (1 + expectedReturn / 100);
    const projectedGain12m = projectedValue12m - investment.amount;

    // Compare to benchmark for performance rating
    const benchmark = BENCHMARK_RETURNS[investment.type] || 8;
    let performance: ProfitabilityData["performance"] = "average";

    if (expectedReturn >= benchmark * 1.2) {
      performance = "excellent";
    } else if (expectedReturn >= benchmark) {
      performance = "good";
    } else if (expectedReturn >= benchmark * 0.7) {
      performance = "average";
    } else {
      performance = "poor";
    }

    return {
      investment,
      monthsHeld,
      annualizedReturn,
      projectedValue12m,
      projectedGain12m,
      performance,
      typeLabel: TYPE_LABELS[investment.type] || investment.type,
    };
  });
}

function getPerformanceBadge(performance: ProfitabilityData["performance"]) {
  switch (performance) {
    case "excellent":
      return <Badge className="bg-secondary text-secondary-foreground">Excelente</Badge>;
    case "good":
      return <Badge className="bg-primary text-primary-foreground">Bom</Badge>;
    case "average":
      return <Badge variant="outline">Regular</Badge>;
    case "poor":
      return <Badge variant="destructive">Baixo</Badge>;
  }
}

function getPerformanceIcon(performance: ProfitabilityData["performance"]) {
  switch (performance) {
    case "excellent":
    case "good":
      return <TrendingUp className="w-4 h-4 text-secondary" />;
    case "average":
      return <BarChart3 className="w-4 h-4 text-muted-foreground" />;
    case "poor":
      return <TrendingDown className="w-4 h-4 text-destructive" />;
  }
}

export function InvestmentProfitabilityAnalysis({
  investments,
}: InvestmentProfitabilityAnalysisProps) {
  if (investments.length === 0) {
    return null;
  }

  const profitabilityData = analyzeProfitability(investments);

  // Calculate portfolio summary
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalProjected12m = profitabilityData.reduce((sum, p) => sum + p.projectedValue12m, 0);
  const totalGain12m = totalProjected12m - totalInvested;
  const weightedReturn =
    totalInvested > 0
      ? profitabilityData.reduce(
          (sum, p) => sum + (p.annualizedReturn * p.investment.amount) / totalInvested,
          0
        )
      : 0;

  // Sort by performance (best first)
  const sortedData = [...profitabilityData].sort((a, b) => {
    const order = { excellent: 0, good: 1, average: 2, poor: 3 };
    return order[a.performance] - order[b.performance];
  });

  const excellentCount = profitabilityData.filter((p) => p.performance === "excellent").length;
  const poorCount = profitabilityData.filter((p) => p.performance === "poor").length;

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-display">Análise de Rentabilidade</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
            <PiggyBank className="w-5 h-5 mx-auto mb-1 text-primary" />
            <div className="text-xs text-muted-foreground">Total Investido</div>
            <div className="font-bold text-foreground">
              R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
            <Percent className="w-5 h-5 mx-auto mb-1 text-secondary" />
            <div className="text-xs text-muted-foreground">Retorno Médio</div>
            <div className="font-bold text-secondary">{weightedReturn.toFixed(1)}% a.a.</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-secondary" />
            <div className="text-xs text-muted-foreground">Projeção 12m</div>
            <div className="font-bold text-foreground">
              R$ {totalProjected12m.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-secondary" />
            <div className="text-xs text-muted-foreground">Ganho Estimado</div>
            <div className="font-bold text-secondary">
              + R$ {totalGain12m.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="flex items-center justify-center gap-4 text-sm">
          {excellentCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-muted-foreground">{excellentCount} excelentes</span>
            </div>
          )}
          {poorCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-destructive"></span>
              <span className="text-muted-foreground">{poorCount} abaixo</span>
            </div>
          )}
        </div>

        {/* Individual Investments */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Desempenho Individual</h4>
          {sortedData.slice(0, 6).map((data) => (
            <div
              key={data.investment.id}
              className="p-3 rounded-lg bg-muted/30 border border-border space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPerformanceIcon(data.performance)}
                  <span className="font-medium text-foreground">{data.investment.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {data.typeLabel}
                  </Badge>
                </div>
                {getPerformanceBadge(data.performance)}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Investido:{" "}
                  <span className="text-foreground font-medium">
                    R$ {data.investment.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Retorno:{" "}
                  <span className={`font-medium ${data.annualizedReturn >= 10 ? "text-secondary" : "text-foreground"}`}>
                    {data.annualizedReturn.toFixed(1)}% a.a.
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Projeção 12m:{" "}
                  <span className="text-foreground">
                    R$ {data.projectedValue12m.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </span>
                <span className="text-secondary font-medium">
                  + R$ {data.projectedGain12m.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {sortedData.length > 6 && (
          <p className="text-xs text-muted-foreground text-center">
            + {sortedData.length - 6} investimentos adicionais
          </p>
        )}

        {poorCount > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <span className="text-muted-foreground">
              {poorCount} {poorCount === 1 ? "investimento está" : "investimentos estão"} com
              rendimento abaixo do benchmark. Considere revisar sua estratégia.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
