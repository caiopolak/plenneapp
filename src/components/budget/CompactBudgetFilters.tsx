import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, SlidersHorizontal, RotateCcw, Plus, X } from 'lucide-react';
import { ImportBudgetsCSV } from './ImportBudgetsCSV';
import { BudgetExport } from '@/utils/dataExport';

export interface BudgetFiltersState {
  searchTerm: string;
  status: string;
}

interface CompactBudgetFiltersProps {
  filters: BudgetFiltersState;
  onFiltersChange: (filters: BudgetFiltersState) => void;
  onReset: () => void;
  budgets: BudgetExport[];
  onImportSuccess: () => void;
  onNewBudget: () => void;
}

export function CompactBudgetFilters({
  filters,
  onFiltersChange,
  onReset,
  budgets,
  onImportSuccess,
  onNewBudget
}: CompactBudgetFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof BudgetFiltersState>(key: K, value: BudgetFiltersState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = [
    filters.status !== 'all',
  ].filter(Boolean).length;

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

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="exceeded">Estourados</SelectItem>
                  <SelectItem value="warning">Em alerta (80%+)</SelectItem>
                  <SelectItem value="good">Sob controle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Import/Export */}
      <ImportBudgetsCSV 
        onSuccess={onImportSuccess} 
        budgets={budgets}
      />

      {/* Botão Novo Orçamento */}
      <Button
        size="sm"
        className={`${buttonGradient} font-display gap-1.5 h-9`}
        onClick={onNewBudget}
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Novo</span>
      </Button>
    </div>
  );
}
