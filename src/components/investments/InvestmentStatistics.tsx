import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, TrendingDown, Calendar, DollarSign, 
  PieChart, Target, Zap, BarChart2 
} from "lucide-react";
import { format, differenceInMonths, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  expected_return: number | null;
  purchase_date: string | null;
}

interface InvestmentStatisticsProps {
  investment: Investment;
  allInvestments: Investment[];
}

const TYPE_LABELS: Record<string, string> = {
  stocks: "Ações",
  bonds: "Títulos",
  crypto: "Criptomoedas",
  real_estate: "Imóveis",
  funds: "Fundos",
  savings: "Poupança",
};

export function InvestmentStatistics({ investment, allInvestments }: InvestmentStatisticsProps) {
  const expectedReturn = investment.expected_return || 0;
  const totalPortfolio = allInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const portfolioShare = totalPortfolio > 0 ? (investment.amount / totalPortfolio) * 100 : 0;
  
  // Calculate holding period
  const holdingMonths = investment.purchase_date 
    ? differenceInMonths(new Date(), new Date(investment.purchase_date))
    : 0;
  const holdingDays = investment.purchase_date 
    ? differenceInDays(new Date(), new Date(investment.purchase_date))
    : 0;

  // Projected values (simple calculation)
  const monthlyReturn = expectedReturn / 12 / 100;
  const projectedYearValue = investment.amount * Math.pow(1 + monthlyReturn, 12);
  const projectedGain = projectedYearValue - investment.amount;

  // Risk assessment based on type
  const getRiskLevel = (type: string) => {
    const riskMap: Record<string, { level: string; value: number; color: string }> = {
      stocks: { level: "Alto", value: 75, color: "text-amber-500" },
      crypto: { level: "Muito Alto", value: 95, color: "text-destructive" },
      bonds: { level: "Baixo", value: 25, color: "text-secondary" },
      real_estate: { level: "Médio", value: 50, color: "text-primary" },
      funds: { level: "Médio", value: 45, color: "text-primary" },
      savings: { level: "Muito Baixo", value: 10, color: "text-secondary" },
    };
    return riskMap[type] || { level: "Médio", value: 50, color: "text-primary" };
  };

  const risk = getRiskLevel(investment.type);

  // Similar investments in portfolio
  const similarInvestments = allInvestments.filter(
    inv => inv.type === investment.type && inv.id !== investment.id
  );
  const typeTotal = allInvestments
    .filter(inv => inv.type === investment.type)
    .reduce((sum, inv) => sum + inv.amount, 0);

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Portfolio Share */}
        <Card className="p-3 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Participação</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {portfolioShare.toFixed(1)}%
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            do portfólio total
          </p>
        </Card>

        {/* Expected Return */}
        <Card className="p-3 bg-gradient-to-br from-secondary/10 to-secondary/5">
          <div className="flex items-center gap-2 mb-2">
            {expectedReturn >= 0 ? (
              <TrendingUp className="h-4 w-4 text-secondary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className="text-xs font-medium text-muted-foreground">Retorno Esperado</span>
          </div>
          <div className={cn(
            "text-xl font-bold",
            expectedReturn >= 0 ? "text-secondary" : "text-destructive"
          )}>
            {expectedReturn > 0 ? "+" : ""}{expectedReturn}%
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            ao ano
          </p>
        </Card>

        {/* Holding Period */}
        <Card className="p-3 bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Tempo Investido</span>
          </div>
          <div className="text-xl font-bold text-foreground">
            {holdingMonths > 0 ? `${holdingMonths}m` : `${holdingDays}d`}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            desde {investment.purchase_date 
              ? format(new Date(investment.purchase_date), "dd/MM/yy", { locale: ptBR })
              : "N/A"
            }
          </p>
        </Card>

        {/* Risk Level */}
        <Card className="p-3 bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Nível de Risco</span>
          </div>
          <div className={cn("text-lg font-bold", risk.color)}>
            {risk.level}
          </div>
          <Progress value={risk.value} className="h-1.5 mt-2" />
        </Card>
      </div>

      {/* Projection Card */}
      <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Projeção de 1 Ano</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Valor Projetado</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(projectedYearValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ganho Estimado</p>
            <p className={cn(
              "text-lg font-bold",
              projectedGain >= 0 ? "text-secondary" : "text-destructive"
            )}>
              {projectedGain >= 0 ? "+" : ""}{formatCurrency(projectedGain)}
            </p>
          </div>
        </div>
      </Card>

      {/* Category Analysis */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Análise por Categoria
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Tipo:</span>
            <span className="font-medium text-foreground">
              {TYPE_LABELS[investment.type] || investment.type}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total no tipo:</span>
            <span className="font-medium text-foreground">{formatCurrency(typeTotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Ativos similares:</span>
            <span className="font-medium text-foreground">{similarInvestments.length}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
