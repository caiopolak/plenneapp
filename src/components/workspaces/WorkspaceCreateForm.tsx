
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  creating: boolean;
  newName: string;
  setNewName: (s: string) => void;
  onCreate: () => void;
  onCancel: () => void;
  setCreating: (b: boolean) => void;
}

export function WorkspaceCreateForm({
  creating, newName, setNewName, onCreate, onCancel, setCreating
}: Props) {
  if (!creating) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCreating(true)}
        className="flex gap-2 mx-auto"
      >
        + Adicionar workspace
      </Button>
    );
  }
  return (
    <div className="flex justify-center gap-2">
      <Input
        autoFocus
        placeholder="Nome do novo workspace"
        value={newName}
        onChange={e => setNewName(e.target.value)}
        className="max-w-[200px]"
      />
      <Button
        variant="secondary"
        onClick={onCreate}
        disabled={!newName.trim()}
      >Criar</Button>
      <Button
        variant="ghost"
        onClick={onCancel}
      >Cancelar</Button>
    </div>
  );
}
