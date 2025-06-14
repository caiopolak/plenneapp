
import React from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface WorkspaceSelectProps {
  value: string | null;
  onChange: (id: string) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * WorkspaceSelect
 * Um seletor reutilizável para selecionar workspace entre os ativos do usuário.
 */
export function WorkspaceSelect({ value, onChange, label, disabled }: WorkspaceSelectProps) {
  const { workspaces } = useWorkspace();

  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <Select
        value={value ?? ""}
        onValueChange={onChange}
        disabled={disabled || workspaces.length < 2}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o workspace" />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
