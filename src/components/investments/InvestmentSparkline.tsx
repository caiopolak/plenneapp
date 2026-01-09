import React, { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface InvestmentSparklineProps {
  history?: { date: string; amount: number }[];
  expectedReturn: number | null;
  className?: string;
}

export function InvestmentSparkline({ history, expectedReturn, className }: InvestmentSparklineProps) {
  // Generate simulated performance data based on expected return
  const data = useMemo(() => {
    if (history && history.length > 0) {
      return history.map((h, i) => ({ x: i, value: h.amount }));
    }
    
    // Generate synthetic data based on expected return for visual effect
    const returnRate = (expectedReturn || 0) / 100;
    const months = 6;
    const baseValue = 100;
    
    return Array.from({ length: months }, (_, i) => {
      const monthlyReturn = returnRate / 12;
      const variation = (Math.random() - 0.4) * 5;
      const value = baseValue * Math.pow(1 + monthlyReturn, i) + variation;
      return { x: i, value: Math.max(95, value) };
    });
  }, [history, expectedReturn]);

  const isPositive = data.length >= 2 ? data[data.length - 1].value >= data[0].value : true;

  return (
    <div className={cn("w-16 h-8", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`investSparkGradient-${isPositive ? 'pos' : 'neg'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? "hsl(var(--secondary))" : "hsl(var(--destructive))"} stopOpacity={0.4} />
              <stop offset="100%" stopColor={isPositive ? "hsl(var(--secondary))" : "hsl(var(--destructive))"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={isPositive ? "hsl(var(--secondary))" : "hsl(var(--destructive))"}
            strokeWidth={1.5}
            fill={`url(#investSparkGradient-${isPositive ? 'pos' : 'neg'})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
