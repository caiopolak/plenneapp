
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Download, Import } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

function parseCSV(content: string) {
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const [header, ...rows] = lines;
  const keys = header.split(",").map(k => k.trim());
  return rows.map(row => {
    const values = row.split(",").map(v => v.trim());
    return Object.fromEntries(keys.map((k, idx) => [k, values[idx]]));
  });
}

export function ImportTransactionsCSV({ onSuccess }: { onSuccess?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { current } = useWorkspace();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const text = await file.text();
      const data = parseCSV(text);
      if (!user || !current) throw new Error("Sem usuário/workspace.");
      // Validar dados essenciais
      const validRows = data.filter(row => row.amount && row.category && row.type && row.date);
      if (!validRows.length) throw new Error("Arquivo inválido ou sem dados obrigatórios.");

      // Registrar importação
      await supabase.from("data_imports").insert([{
        type: "transactions",
        user_id: user.id,
        workspace_id: current.id,
        filename: file.name,
        status: "completed"
      }]);

      // Inserir transações (em lotes de 100)
      while (validRows.length > 0) {
        const batch = validRows.splice(0, 100);
        const rows = batch.map((r: any) => ({
          user_id: user.id,
          workspace_id: current.id,
          amount: Number(r.amount),
          category: r.category,
          type: r.type,
          date: r.date,
          description: r.description || null,
          is_recurring: r.is_recurring === "true" ? true : false,
          recurrence_pattern: r.recurrence_pattern || null,
          recurrence_end_date: r.recurrence_end_date || null
        }));
        const { error } = await supabase.from("transactions").insert(rows);
        if (error) {
          toast({ variant: "destructive", title: "Erro em lote", description: error.message });
          break;
        }
      }

      toast({ title: "Sucesso", description: "Transações importadas!" });
      if (onSuccess) onSuccess();

    } catch (err: any) {
      toast({ variant: "destructive", title: "Erro ao importar", description: err.message });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar transações em lote</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={inputRef}
          onChange={handleFile}
          disabled={loading}
        />
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          <Import className="w-4 h-4 mr-2" />
          Escolher arquivo CSV
        </Button>
        <div className="text-xs text-muted-foreground">
          O arquivo deve conter colunas:<br />
          <code>amount,category,type,date[,description,is_recurring,recurrence_pattern,recurrence_end_date]</code>
        </div>
        <Button
          variant="ghost"
          asChild
          className="inline-flex gap-2"
          size="sm"
        >
          <a href="/modelo-importacao.csv" download>
            <Download className="w-4 h-4" />
            Baixar modelo
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
