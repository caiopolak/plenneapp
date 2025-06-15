
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
  const buttonGradient =
    "bg-gradient-to-tr from-[#003f5c]/80 to-[#2f9e44]/40 text-white hover:from-[#003f5c] hover:to-[#2f9e44]";

  const handleExport = () => {
    exportGoalsCsv(goals);
    toast({
      title: "Exportação concluída",
      description: "As metas foram exportadas para CSV.",
    });
  };

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
      <Button
        variant="outline"
        size="sm"
        className="font-display flex gap-2 border border-[--primary]/20 shadow min-w-[170px] w-full sm:w-auto"
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
            className="font-display flex gap-2 border border-[--primary]/20 shadow min-w-[170px] w-full sm:w-auto"
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
