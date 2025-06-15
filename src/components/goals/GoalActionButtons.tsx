
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Download, Import } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ImportGoalsCSV } from "./ImportGoalsCSV";
import { useToast } from "@/hooks/use-toast";
import { exportGoalsCsv } from "./utils/exportGoalsCsv";

export function GoalActionButtons({
  goals, 
  onSearchChange, 
  search, 
  priorityFilter, 
  onPriorityChange, 
  onImportSuccess, 
  showForm, 
  setShowForm 
}: {
  goals: any[];
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  search: string;
  priorityFilter: string;
  onPriorityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onImportSuccess: () => void;
  showForm: boolean;
  setShowForm: (b: boolean) => void;
}) {
  const { toast } = useToast();

  const handleExport = () => {
    exportGoalsCsv(goals);
    toast({
      title: "Exportação concluída",
      description: "As metas foram exportadas para CSV.",
    });
  };

  return (
    <div className="flex gap-2 items-center flex-wrap">
      <Input
        type="text"
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar..."
        className="h-9"
      />
      <select
        className="rounded-md border border-input bg-background h-9 px-2 text-sm"
        value={priorityFilter}
        onChange={onPriorityChange}
      >
        <option value="all">Todas</option>
        <option value="high">Alta</option>
        <option value="medium">Média</option>
        <option value="low">Baixa</option>
      </select>
      <Button
        variant="outline"
        size="sm"
        className="font-display flex gap-2 bg-white border border-[--primary]/20 text-[--primary] hover:bg-[--secondary]/10 shadow min-w-[170px]"
        onClick={handleExport}
      >
        <Download className="w-4 h-4" />
        Exportar CSV
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="font-display flex gap-2 bg-white border border-[--primary]/20 text-[--primary] hover:bg-[--secondary]/10 shadow min-w-[170px]"
          >
            <Import className="w-4 h-4" />
            Importar CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar metas em lote (CSV)</DialogTitle>
          </DialogHeader>
          <ImportGoalsCSV onSuccess={onImportSuccess} />
        </DialogContent>
      </Dialog>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogTrigger asChild>
          <Button size="lg" className="bg-gradient-to-r from-[#003f5c] to-[#2f9e44] text-white font-bold shadow-xl hover:from-[#2f9e44] hover:to-[#003f5c] hover:scale-105 transition">
            <Plus className="w-4 h-4 mr-2" />
            Nova Meta
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}
