
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, Users, Briefcase, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WorkspaceTypeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceName: string;
  currentType: string | null | undefined;
  onSuccess: () => void;
}

const typeOptions = [
  {
    value: "personal",
    label: "Pessoal",
    icon: User,
    description: "Somente você usa este ambiente",
  },
  {
    value: "family",
    label: "Família",
    icon: Users,
    description: "Compartilhado com familiares",
  },
  {
    value: "business",
    label: "Empresa",
    icon: Briefcase,
    description: "Para uso profissional ou time",
  },
];

export function WorkspaceTypeEditor({
  open,
  onOpenChange,
  workspaceId,
  workspaceName,
  currentType,
  onSuccess,
}: WorkspaceTypeEditorProps) {
  const [selectedType, setSelectedType] = useState(currentType || "personal");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (selectedType === currentType) {
      onOpenChange(false);
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("workspaces")
      .update({ type: selectedType })
      .eq("id", workspaceId);

    setSaving(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar tipo",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Tipo alterado com sucesso!",
      description: `Workspace "${workspaceName}" agora é do tipo "${typeOptions.find(t => t.value === selectedType)?.label}"`,
    });

    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Tipo do Workspace</DialogTitle>
          <DialogDescription>
            Escolha o tipo do workspace "{workspaceName}". Isso ajuda a organizar suas finanças
            em contextos diferentes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {typeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedType(option.value)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
                {isSelected && (
                  <Check className="w-5 h-5 text-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
