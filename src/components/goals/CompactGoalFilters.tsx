import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, SlidersHorizontal, RotateCcw, Plus, X } from 'lucide-react';
import { ImportGoalsCSV } from './ImportGoalsCSV';
import { GoalExport } from '@/utils/dataExport';

export interface GoalFilters {
  searchTerm: string;
  priority: string;
  status: string;
}

interface CompactGoalFiltersProps {
  filters: GoalFilters;
  onFiltersChange: (filters: GoalFilters) => void;
  onReset: () => void;
  goals: any[];
  onImportSuccess: () => void;
  onNewGoal: () => void;
}

export function CompactGoalFilters({
  filters,
  onFiltersChange,
  onReset,
  goals,
  onImportSuccess,
  onNewGoal
}: CompactGoalFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof GoalFilters>(key: K, value: GoalFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFiltersCount = [
    filters.priority !== 'all',
    filters.status !== 'all',
  ].filter(Boolean).length;

  // Mapear para o formato de exportação
  const goalsForExport: GoalExport[] = goals.map(g => ({
    name: g.name,
    target_amount: Number(g.target_amount),
    current_amount: Number(g.current_amount || 0),
    priority: g.priority || 'medium',
    target_date: g.target_date || null,
    note: g.note || null,
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

            {/* Prioridade */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Prioridade</Label>
              <Select value={filters.priority} onValueChange={(v) => updateFilter('priority', v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Em andamento</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Import/Export */}
      <ImportGoalsCSV 
        onSuccess={onImportSuccess} 
        goals={goalsForExport}
      />

      {/* Botão Nova Meta */}
      <Button
        size="sm"
        className={`${buttonGradient} font-display gap-1.5 h-9`}
        onClick={onNewGoal}
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nova Meta</span>
      </Button>
    </div>
  );
}
