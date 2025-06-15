
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter } from 'lucide-react';

export type PeriodOption = '1month' | '3months' | '6months' | '1year' | 'custom';

interface PeriodFilterProps {
  period: PeriodOption;
  onPeriodChange: (period: PeriodOption) => void;
}

export function PeriodFilter({ period, onPeriodChange }: PeriodFilterProps) {
  const periodLabels = {
    '1month': 'Último mês',
    '3months': 'Últimos 3 meses',
    '6months': 'Últimos 6 meses',
    '1year': 'Último ano',
    'custom': 'Período personalizado'
  };

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Select value={period} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecionar período" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(periodLabels).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                {label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function getPeriodDates(period: PeriodOption): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  
  let startDate: string;
  
  switch (period) {
    case '1month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0];
      break;
    case '3months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString().split('T')[0];
      break;
    case '6months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).toISOString().split('T')[0];
      break;
    case '1year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0];
  }
  
  return { startDate, endDate };
}
