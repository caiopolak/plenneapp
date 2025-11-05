
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check } from "lucide-react";
import { WorkspaceNameEditField } from "./WorkspaceNameEditField";

interface WorkspaceCardProps {
  name: string;
  selected: boolean;
  onSelect(): void;
  onEdit(): void;
  onDelete(): void;
  onSaveEdit?(value: string): void;
  editing: boolean;
  editName: string;
  setEditName?: (v: string) => void;
  disableDelete?: boolean;
}

export function WorkspaceCard({
  name,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onSaveEdit,
  editing,
  editName,
  setEditName,
  disableDelete
}: WorkspaceCardProps) {
  return (
    <div
      className={`relative rounded-2xl px-4 py-4 flex items-center gap-4 border shadow-card bg-card transition-all 
        ${
          selected
            ? "border-primary shadow-lg ring-2 ring-primary/20"
            : "border-border"
        }
      `}
    >
      <Button
        variant={selected ? "secondary" : "ghost"}
        className="w-8 h-8 rounded-full mr-1"
        onClick={onSelect}
        aria-label="Selecionar workspace"
      >
        <Check className="w-4 h-4" />
      </Button>
      {editing && setEditName && onSaveEdit ? (
        <WorkspaceNameEditField
          value={editName}
          onChange={setEditName}
          onSave={() => onSaveEdit(editName)}
          onCancel={onEdit}
        />
      ) : (
        <>
          <span
            className="flex-1 font-semibold text-[1.1rem] md:text-lg text-primary truncate"
            title={name}
          >
            {name}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={onEdit}
            className="shrink-0"
            aria-label="Editar workspace"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0"
            aria-label="Excluir workspace"
            onClick={onDelete}
            disabled={disableDelete}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </>
      )}
    </div>
  );
}
