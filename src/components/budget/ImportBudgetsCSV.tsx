import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DataImportExportModal } from "@/components/data/DataImportExportModal";
import { parseCSV, importData, budgetMappings, BudgetImport } from "@/utils/dataImport";
import { exportBudgets, BudgetExport } from "@/utils/dataExport";

interface ImportBudgetsCSVProps {
  onSuccess: () => void;
  budgets?: BudgetExport[];
}

const templateColumns = [
  'Categoria',
  'Limite',
  'Mês',
  'Ano'
];

const exampleData = [
  'Alimentação',
  '1500',
  '12',
  '2024'
];

export function ImportBudgetsCSV({ onSuccess, budgets = [] }: ImportBudgetsCSVProps) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const { current: workspace } = useWorkspace();
  const { toast } = useToast();

  const handleImport = async (file: File): Promise<{ success: boolean; message: string; errors?: string[] }> => {
    if (!user || !workspace) {
      return { success: false, message: 'Usuário ou workspace não encontrado' };
    }

    try {
      const text = await file.text();
      const csvData = parseCSV(text);

      if (csvData.length === 0) {
        return { success: false, message: 'Arquivo vazio ou formato inválido' };
      }

      const result = importData<BudgetImport>(csvData, budgetMappings);

      if (result.validRows === 0) {
        return {
          success: false,
          message: 'Nenhuma linha válida encontrada',
          errors: result.errors
        };
      }

      // Registrar importação
      await supabase.from("data_imports").insert([{
        type: "budgets",
        user_id: user.id,
        workspace_id: workspace.id,
        filename: file.name,
        status: "completed"
      }]);

      // Inserir orçamentos (verificando duplicatas)
      let inserted = 0;
      let skipped = 0;

      for (const budget of result.data) {
        // Verificar se já existe orçamento para essa categoria/mês/ano
        const { data: existing } = await supabase
          .from("budgets")
          .select("id")
          .eq("user_id", user.id)
          .eq("workspace_id", workspace.id)
          .eq("category", budget.category)
          .eq("month", budget.month)
          .eq("year", budget.year)
          .single();

        if (existing) {
          skipped++;
          continue;
        }

        const { error } = await supabase.from("budgets").insert({
          user_id: user.id,
          workspace_id: workspace.id,
          category: budget.category,
          amount_limit: budget.amount_limit,
          month: budget.month,
          year: budget.year
        });

        if (error) throw error;
        inserted++;
      }

      onSuccess();

      let message = `${inserted} orçamentos importados com sucesso!`;
      if (skipped > 0) {
        message += ` (${skipped} ignorados por já existirem)`;
      }

      return {
        success: true,
        message,
        errors: result.errors.length > 0 ? result.errors : undefined
      };

    } catch (error: any) {
      return { success: false, message: error.message || 'Erro ao processar arquivo' };
    }
  };

  const handleExport = () => {
    if (budgets.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Sem dados',
        description: 'Não há orçamentos para exportar'
      });
      return;
    }
    exportBudgets(budgets);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="gap-2"
      >
        <Import className="h-4 w-4" />
        Importar/Exportar
      </Button>

      <DataImportExportModal
        open={showModal}
        onOpenChange={setShowModal}
        type="budgets"
        onImport={handleImport}
        onExport={handleExport}
        templateColumns={templateColumns}
        exampleData={exampleData}
      />
    </>
  );
}
