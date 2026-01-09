import React from "react";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit2, Trash2, TrendingUp, TrendingDown, Eye, 
  Calendar, DollarSign, PieChart
} from 'lucide-react';
import { format, differenceInMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { InvestmentSparkline } from "./InvestmentSparkline";
import { cn } from "@/lib/utils";

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  expected_return: number | null;
  purchase_date: string | null;
}

interface InvestmentCardEnhancedProps {
  investment: Investment;
  index: number;
  totalPortfolio: number;
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  stocks: "Ações",
  bonds: "Títulos",
  crypto: "Criptomoedas",
  real_estate: "Imóveis",
  funds: "Fundos",
  savings: "Poupança",
};

const TYPE_ICONS: Record<string, string> = {
  stocks: "📈",
  bonds: "📜",
  crypto: "₿",
  real_estate: "🏠",
  funds: "💼",
  savings: "🏦",
};

const TYPE_COLORS: Record<string, { bg: string; border: string }> = {
  stocks: { bg: "bg-primary/10", border: "border-primary/20" },
  bonds: { bg: "bg-secondary/10", border: "border-secondary/20" },
  crypto: { bg: "bg-amber-500/10", border: "border-amber-500/20" },
  real_estate: { bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  funds: { bg: "bg-violet-500/10", border: "border-violet-500/20" },
  savings: { bg: "bg-slate-500/10", border: "border-slate-500/20" },
};

export function InvestmentCardEnhanced({
  investment,
  index,
  totalPortfolio,
  onDetails,
  onEdit,
  onDelete
}: InvestmentCardEnhancedProps) {
  const expectedReturn = investment.expected_return || 0;
  const isPositive = expectedReturn >= 0;
  const portfolioShare = totalPortfolio > 0 ? (investment.amount / totalPortfolio) * 100 : 0;
  
  // Calculate projected annual gain
  const projectedGain = investment.amount * (expectedReturn / 100);
  
  // Holding period
  const holdingMonths = investment.purchase_date 
    ? differenceInMonths(new Date(), new Date(investment.purchase_date))
    : 0;

  const colors = TYPE_COLORS[investment.type] || { bg: "bg-muted", border: "border-border" };

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in opacity-0",
        colors.bg,
        "border",
        colors.border
      )}
      style={{ 
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {/* Type Color Strip */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full",
        investment.type === "stocks" && "bg-primary",
        investment.type === "bonds" && "bg-secondary",
        investment.type === "crypto" && "bg-amber-500",
        investment.type === "real_estate" && "bg-emerald-500",
        investment.type === "funds" && "bg-violet-500",
        investment.type === "savings" && "bg-slate-500"
      )} />

      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon + Name + Type */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform hover:scale-110",
              "bg-background/50"
            )}>
              {TYPE_ICONS[investment.type] || "💰"}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base text-foreground truncate">
                {investment.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <Badge variant="secondary" className="text-[10px] h-5">
                  {TYPE_LABELS[investment.type] || investment.type}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] h-5 gap-0.5",
                    isPositive 
                      ? "border-secondary/50 text-secondary" 
                      : "border-destructive/50 text-destructive"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {expectedReturn > 0 ? "+" : ""}{expectedReturn}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Right: Sparkline */}
          <InvestmentSparkline 
            expectedReturn={investment.expected_return} 
            className="hidden sm:block" 
          />
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        {/* Values Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-lg bg-background/50 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center justify-center gap-1">
              <DollarSign className="h-3 w-3" />
              Valor
            </div>
            <div className="font-bold text-foreground text-sm mt-0.5">
              R$ {formatCurrency(investment.amount)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-background/50 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center justify-center gap-1">
              <PieChart className="h-3 w-3" />
              Portfólio
            </div>
            <div className="font-bold text-primary text-sm mt-0.5">
              {portfolioShare.toFixed(1)}%
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-background/50 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {isPositive ? "Ganho" : "Perda"}/Ano
            </div>
            <div className={cn(
              "font-bold text-sm mt-0.5",
              isPositive ? "text-secondary" : "text-destructive"
            )}>
              {isPositive ? "+" : ""}R$ {formatCurrency(Math.abs(projectedGain))}
            </div>
          </div>
        </div>

        {/* Extra Info Row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {investment.purchase_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(investment.purchase_date), "dd/MM/yy", { locale: ptBR })}</span>
              {holdingMonths > 0 && (
                <span className="text-muted-foreground/70">({holdingMonths}m)</span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs gap-1.5"
            onClick={onDetails}
          >
            <Eye className="h-3.5 w-3.5" />
            Detalhes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
