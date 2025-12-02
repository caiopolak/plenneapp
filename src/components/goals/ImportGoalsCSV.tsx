import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DataImportExportModal } from "@/components/data/DataImportExportModal";
import { parseCSV, importData, goalMappings, GoalImport } from "@/utils/dataImport";
import { exportGoals, GoalExport } from "@/utils/dataExport";

interface ImportGoalsCSVProps {
  onSuccess: () => void;
  goals?: GoalExport[];
}

const templateColumns = [
  'Nome',
  'Valor Alvo',
  'Valor Atual',
  'Prioridade',
  'Data Limite',
  'Observação'
];

const exampleData = [
  'Reserva de Emergência',
  '10000',
  '2500',
  'Alta',
  '31/12/2025',
  'Meta principal do ano'
];

export function ImportGoalsCSV({ onSuccess, goals = [] }: ImportGoalsCSVProps) {
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

      const result = importData<GoalImport>(csvData, goalMappings);

      if (result.validRows === 0) {
        return {
          success: false,
          message: 'Nenhuma linha válida encontrada',
          errors: result.errors
        };
      }

      // Registrar importação
      await supabase.from("data_imports").insert([{
        type: "goals",
        user_id: user.id,
        workspace_id: workspace.id,
        filename: file.name,
        status: "completed"
      }]);

      // Inserir metas em lotes
      const batchSize = 50;
      let inserted = 0;

      for (let i = 0; i < result.data.length; i += batchSize) {
        const batch = result.data.slice(i, i + batchSize);
        const rows = batch.map(g => ({
          user_id: user.id,
          workspace_id: workspace.id,
          name: g.name,
          target_amount: g.target_amount,
          current_amount: g.current_amount || 0,
          priority: g.priority || 'medium',
          target_date: g.target_date || null,
          note: g.note || null
        }));

        const { error } = await supabase.from("financial_goals").insert(rows);
        if (error) throw error;
        inserted += batch.length;
      }

      onSuccess();

      return {
        success: true,
        message: `${inserted} metas importadas com sucesso!`,
        errors: result.errors.length > 0 ? result.errors : undefined
      };

    } catch (error: any) {
      return { success: false, message: error.message || 'Erro ao processar arquivo' };
    }
  };

  const handleExport = () => {
    if (goals.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Sem dados',
        description: 'Não há metas para exportar'
      });
      return;
    }
    exportGoals(goals);
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
        type="goals"
        onImport={handleImport}
        onExport={handleExport}
        templateColumns={templateColumns}
        exampleData={exampleData}
      />
    </>
  );
}
