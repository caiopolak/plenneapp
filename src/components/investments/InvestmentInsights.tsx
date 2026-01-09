import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Wallet, PieChart, AlertTriangle } from 'lucide-react';

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  expected_return: number | null;
  purchase_date: string | null;
}

interface InvestmentInsightsProps {
  investments: Investment[];
}

export function InvestmentInsights({ investments }: InvestmentInsightsProps) {
  const insights = useMemo(() => {
    if (investments.length === 0) return [];

    const result: { icon: React.ElementType; title: string; description: string; type: 'success' | 'warning' | 'info' | 'neutral' }[] = [];

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const avgReturn = investments.reduce((sum, inv) => sum + (inv.expected_return || 0), 0) / investments.length;

    // Diversificação por tipo
    const typeCount = new Set(investments.map(inv => inv.type)).size;
    if (typeCount >= 3) {
      result.push({
        icon: PieChart,
        title: 'Boa diversificação',
        description: `Você tem ${typeCount} tipos de ativos diferentes, reduzindo riscos.`,
        type: 'success',
      });
    } else if (typeCount === 1 && investments.length > 2) {
      result.push({
        icon: AlertTriangle,
        title: 'Baixa diversificação',
        description: 'Considere diversificar em outros tipos de ativos.',
        type: 'warning',
      });
    }

    // Retorno médio esperado
    if (avgReturn >= 12) {
      result.push({
        icon: TrendingUp,
        title: 'Retorno expressivo',
        description: `Retorno médio de ${avgReturn.toFixed(1)}% a.a. está acima da média do mercado.`,
        type: 'success',
      });
    } else if (avgReturn > 0 && avgReturn < 6) {
      result.push({
        icon: TrendingDown,
        title: 'Retorno conservador',
        description: `Retorno médio de ${avgReturn.toFixed(1)}% a.a. Avalie opções mais rentáveis.`,
        type: 'info',
      });
    }

    // Maior concentração
    const typeAmounts = investments.reduce((acc, inv) => {
      acc[inv.type] = (acc[inv.type] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topType = Object.entries(typeAmounts).sort((a, b) => b[1] - a[1])[0];
    if (topType) {
      const percentage = (topType[1] / totalInvested) * 100;
      const typeLabels: Record<string, string> = {
        stocks: 'Ações',
        bonds: 'Títulos',
        crypto: 'Criptomoedas',
        real_estate: 'Imóveis',
        funds: 'Fundos',
        savings: 'Poupança'
      };
      if (percentage >= 60) {
        result.push({
          icon: Target,
          title: `Foco em ${typeLabels[topType[0]] || topType[0]}`,
          description: `${percentage.toFixed(0)}% do portfólio concentrado nessa categoria.`,
          type: percentage > 80 ? 'warning' : 'neutral',
        });
      }
    }

    // Total investido
    if (totalInvested >= 50000) {
      result.push({
        icon: Wallet,
        title: 'Patrimônio sólido',
        description: `R$ ${totalInvested.toLocaleString('pt-BR')} investidos. Continue construindo!`,
        type: 'success',
      });
    } else if (investments.length >= 1) {
      result.push({
        icon: Wallet,
        title: 'Em crescimento',
        description: `R$ ${totalInvested.toLocaleString('pt-BR')} investidos. Cada aporte conta!`,
        type: 'info',
      });
    }

    return result.slice(0, 4);
  }, [investments]);

  if (insights.length === 0) return null;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
      case 'info':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {insights.map((insight, index) => {
        const Icon = insight.icon;
        return (
          <Card
            key={index}
            className={`border transition-all duration-200 hover:scale-[1.02] ${getTypeStyles(insight.type)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background/50">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{insight.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
