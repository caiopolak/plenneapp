
import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function WorkspaceNameEditField({ value, onChange, onSave, onCancel }: Props) {
  return (
    <>
      <input
        autoFocus
        type="text"
        className="border rounded-md px-2 py-1 text-base min-w-[120px] max-w-[160px] bg-background"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
        data-testid="edit-workspace-input"
      />
      <Button size="sm" className="ml-2" onClick={onSave} disabled={!value.trim()}>
        Salvar
      </Button>
      <Button size="sm" variant="ghost" className="ml-2" onClick={onCancel}>
        Cancelar
      </Button>
    </>
  );
}
