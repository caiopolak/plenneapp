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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = [
    filters.type !== 'all',
    filters.category !== 'all',
    filters.minAmount,
    filters.maxAmount,
    filters.startDate,
    filters.endDate
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0 || filters.searchTerm;

  return (
    <div className="space-y-4">
      {/* Linha principal de filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição ou categoria..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="pl-9 w-full"
          />
          {filters.searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => updateFilter('searchTerm', '')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filtro de Tipo */}
        <Select value={filters.type} onValueChange={(v) => updateFilter('type', v)}>
          <SelectTrigger className="w-full md:w-36">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>

        {/* Botão Filtros Avançados */}
        <Button
          variant={showAdvanced ? "secondary" : "outline"}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Botão Reset */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
          {/* Categoria */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Categoria</Label>
            <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
              <SelectTrigger>
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

          {/* Valor Mínimo */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Valor Mínimo</Label>
            <Input
              type="number"
              placeholder="R$ 0,00"
              value={filters.minAmount}
              onChange={(e) => updateFilter('minAmount', e.target.value)}
            />
          </div>

          {/* Valor Máximo */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Valor Máximo</Label>
            <Input
              type="number"
              placeholder="R$ 0,00"
              value={filters.maxAmount}
              onChange={(e) => updateFilter('maxAmount', e.target.value)}
            />
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Período</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, "dd/MM", { locale: ptBR }) : "Início"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, "dd/MM", { locale: ptBR }) : "Fim"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
      )}

      {/* Tags de filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.type !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.type === 'income' ? 'Receitas' : 'Despesas'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('type', 'all')} 
              />
            </Badge>
          )}
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.category}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('category', 'all')} 
              />
            </Badge>
          )}
          {filters.minAmount && (
            <Badge variant="secondary" className="gap-1">
              Min: R$ {filters.minAmount}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('minAmount', '')} 
              />
            </Badge>
          )}
          {filters.maxAmount && (
            <Badge variant="secondary" className="gap-1">
              Max: R$ {filters.maxAmount}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('maxAmount', '')} 
              />
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="secondary" className="gap-1">
              De: {format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('startDate', undefined)} 
              />
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="secondary" className="gap-1">
              Até: {format(filters.endDate, "dd/MM/yyyy", { locale: ptBR })}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('endDate', undefined)} 
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
