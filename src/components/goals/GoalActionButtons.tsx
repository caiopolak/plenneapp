import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ImportGoalsCSV } from "./ImportGoalsCSV";
import { GoalExport } from "@/utils/dataExport";

interface GoalActionButtonsProps {
  goals: any[];
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  search: string;
  priorityFilter: string;
  onPriorityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onImportSuccess: () => void;
  showForm: boolean;
  setShowForm: (b: boolean) => void;
}

export function GoalActionButtons({
  goals, 
  onSearchChange, 
  search, 
  priorityFilter, 
  onPriorityChange, 
  onImportSuccess, 
  showForm, 
  setShowForm 
}: GoalActionButtonsProps) {
  const buttonGradient =
    "bg-gradient-to-tr from-[#003f5c]/80 to-[#2f9e44]/40 text-white hover:from-[#003f5c] hover:to-[#2f9e44]";

  // Mapear para o formato de exportação
  const goalsForExport: GoalExport[] = goals.map(g => ({
    name: g.name,
    target_amount: Number(g.target_amount),
    current_amount: Number(g.current_amount || 0),
    priority: g.priority || 'medium',
    target_date: g.target_date || null,
    note: g.note || null,
  }));

  return (
    <div className="flex gap-2 items-center flex-wrap w-full sm:w-auto">
      <Input
        type="text"
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar..."
        className="min-h-[44px] sm:min-h-[36px] flex-1 sm:flex-none sm:w-40"
      />
      <select
        className="rounded-md border border-input bg-background min-h-[44px] sm:min-h-[36px] px-3 text-sm flex-1 sm:flex-none sm:w-28"
        value={priorityFilter}
        onChange={onPriorityChange}
      >
        <option value="all">Todas</option>
        <option value="high">Alta</option>
        <option value="medium">Média</option>
        <option value="low">Baixa</option>
      </select>
      <ImportGoalsCSV 
        onSuccess={onImportSuccess} 
        goals={goalsForExport}
      />
      <Button
        size="sm"
        className={`${buttonGradient} font-display flex gap-2 flex-1 sm:flex-none min-h-[44px] sm:min-h-[36px]`}
        onClick={() => setShowForm(true)}
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nova Meta</span>
        <span className="sm:hidden">Nova</span>
      </Button>
    </div>
  );
}
