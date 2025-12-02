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
    <div className="flex gap-2 items-center flex-wrap w-full">
      <Input
        type="text"
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar..."
        className="h-9 w-full sm:w-auto"
      />
      <select
        className="rounded-md border border-input bg-background h-9 px-2 text-sm w-full sm:w-auto"
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
        className={`${buttonGradient} font-display flex gap-2 min-w-[170px] w-full sm:w-auto`}
        onClick={() => setShowForm(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Nova Meta
      </Button>
    </div>
  );
}
