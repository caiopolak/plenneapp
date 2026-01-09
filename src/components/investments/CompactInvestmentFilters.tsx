import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, SlidersHorizontal, RotateCcw, Plus, X } from 'lucide-react';
import { ImportInvestmentsCSV } from './ImportInvestmentsCSV';
import { InvestmentExport } from '@/utils/dataExport';

export interface InvestmentFilters {
  searchTerm: string;
  type: string;
}

interface CompactInvestmentFiltersProps {
  filters: InvestmentFilters;
  onFiltersChange: (filters: InvestmentFilters) => void;
  onReset: () => void;
  investments: any[];
  onImportSuccess: () => void;
  onNewInvestment: () => void;
}

export function CompactInvestmentFilters({
  filters,
  onFiltersChange,
  onReset,
  investments,
  onImportSuccess,
  onNewInvestment
}: CompactInvestmentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof InvestmentFilters>(key: K, value: InvestmentFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = [
    filters.type !== 'all',
  ].filter(Boolean).length;

  const investmentsForExport: InvestmentExport[] = investments.map(inv => ({
    name: inv.name,
    type: inv.type,
    amount: Number(inv.amount),
    expected_return: inv.expected_return ? Number(inv.expected_return) : undefined,
    purchase_date: inv.purchase_date || undefined,
  }));

  const buttonGradient =
    "bg-gradient-to-tr from-[hsl(var(--primary))]/80 to-[hsl(var(--secondary))]/60 text-white hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--secondary))]";

  return (
    <div className="flex items-center gap-2">
      {/* Busca compacta */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className="pl-8 w-28 sm:w-36 h-9 text-sm"
        />
        {filters.searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => updateFilter('searchTerm', '')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Popover de filtros */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 h-9"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <Badge 
                variant="default" 
                className="ml-0.5 h-5 min-w-[20px] px-1.5 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filtros</h4>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onReset}
                  className="h-7 text-xs gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Limpar
                </Button>
              )}
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tipo de Ativo</Label>
              <Select value={filters.type} onValueChange={(v) => updateFilter('type', v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="stocks">Ações</SelectItem>
                  <SelectItem value="bonds">Títulos</SelectItem>
                  <SelectItem value="crypto">Criptomoedas</SelectItem>
                  <SelectItem value="real_estate">Imóveis</SelectItem>
                  <SelectItem value="funds">Fundos</SelectItem>
                  <SelectItem value="savings">Poupança</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Import/Export */}
      <ImportInvestmentsCSV 
        onSuccess={onImportSuccess} 
        investments={investmentsForExport}
      />

      {/* Botão Novo Investimento */}
      <Button
        size="sm"
        className={`${buttonGradient} font-display gap-1.5 h-9`}
        onClick={onNewInvestment}
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Novo</span>
      </Button>
    </div>
  );
}
