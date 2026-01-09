import React, { useMemo } from 'react';
import { subDays, format, startOfDay } from 'date-fns';
interface Transaction {
  type: string;
  amount: number;
  date: string;
}

interface TransactionSparklineProps {
  transactions: Transaction[];
  type: 'income' | 'expense' | 'balance';
  days?: number;
  height?: number;
  color?: string;
}

// Simple sparkline component without external dependency
export function TransactionSparkline({ 
  transactions, 
  type, 
  days = 30,
  height = 40,
  color
}: TransactionSparklineProps) {
  const data = useMemo(() => {
    const now = new Date();
    const dailyData: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const day = startOfDay(subDays(now, i));
      const dayStr = format(day, 'yyyy-MM-dd');
      
      const dayTransactions = transactions.filter(t => 
        t.date === dayStr
      );

      let value = 0;
      if (type === 'income') {
        value = dayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
      } else if (type === 'expense') {
        value = dayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);
      } else {
        const income = dayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        const expense = dayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        value = income - expense;
      }

      dailyData.push(value);
    }

    return dailyData;
  }, [transactions, type, days]);

  const lineColor = color || (
    type === 'income' ? 'hsl(var(--chart-2))' : 
    type === 'expense' ? 'hsl(var(--destructive))' : 
    'hsl(var(--primary))'
  );

  // Calculate path for SVG
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  const pathD = `M ${points.split(' ').map((p, i) => {
    const [x, y] = p.split(',');
    return i === 0 ? `${x} ${y}` : `L ${x} ${y}`;
  }).join(' ')}`;

  // Gradient area path
  const areaPathD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <svg 
      width="100%" 
      height={height} 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
          <stop offset="100%" stopColor={lineColor} stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <path
        d={areaPathD}
        fill={`url(#gradient-${type})`}
      />
      <path
        d={pathD}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
