import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface TransactionFilters {
  searchTerm: string;
  type: string;
  category: string;
  minAmount: string;
  maxAmount: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

interface CompactTransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  categories: string[];
  onReset: () => void;
}

export function CompactTransactionFilters({
  filters,
  onFiltersChange,
  categories,
  onReset
}: CompactTransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = [
    filters.searchTerm,
    filters.type !== 'all',
    filters.category !== 'all',
    filters.minAmount,
    filters.maxAmount,
    filters.startDate,
    filters.endDate
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-2">
      {/* Busca compacta */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className="pl-8 w-32 sm:w-44 h-9 text-sm"
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
        <PopoverContent className="w-80 p-4" align="end">
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
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <Select value={filters.type} onValueChange={(v) => updateFilter('type', v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Categoria</Label>
              <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Valores */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Valor mín.</Label>
                <Input
                  type="number"
                  placeholder="R$ 0"
                  value={filters.minAmount}
                  onChange={(e) => updateFilter('minAmount', e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Valor máx.</Label>
                <Input
                  type="number"
                  placeholder="R$ 0"
                  value={filters.maxAmount}
                  onChange={(e) => updateFilter('maxAmount', e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {/* Período */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Período</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-start text-left font-normal h-9",
                        !filters.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {filters.startDate ? format(filters.startDate, "dd/MM", { locale: ptBR }) : "Início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => updateFilter('startDate', date)}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 justify-start text-left font-normal h-9",
                        !filters.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                      {filters.endDate ? format(filters.endDate, "dd/MM", { locale: ptBR }) : "Fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => updateFilter('endDate', date)}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Manter o componente antigo para compatibilidade
interface AdvancedTransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  categories: string[];
  onReset: () => void;
}

export function AdvancedTransactionFilters({
  filters,
  onFiltersChange,
  categories,
  onReset
}: AdvancedTransactionFiltersProps) {
  return (
    <CompactTransactionFilters
      filters={filters}
      onFiltersChange={onFiltersChange}
      categories={categories}
      onReset={onReset}
    />
  );
}
