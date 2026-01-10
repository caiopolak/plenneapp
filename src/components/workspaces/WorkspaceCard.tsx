import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, Users, Briefcase, User, Settings2 } from "lucide-react";
import { WorkspaceNameEditField } from "./WorkspaceNameEditField";
import { WorkspaceTypeEditor } from "./WorkspaceTypeEditor";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WorkspaceCardProps {
  id: string;
  name: string;
  type?: string | null;
  selected: boolean;
  onSelect(): void;
  onEdit(): void;
  onDelete(): void;
  onSaveEdit?(value: string): void;
  editing: boolean;
  editName: string;
  setEditName?: (v: string) => void;
  disableDelete?: boolean;
  onReload?: () => void;
}

export function WorkspaceCard({
  id,
  name,
  type,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onSaveEdit,
  editing,
  editName,
  setEditName,
  disableDelete,
  onReload
}: WorkspaceCardProps) {
  const [typeEditorOpen, setTypeEditorOpen] = useState(false);

  const getTypeIcon = () => {
    switch (type) {
      case 'family':
        return <Users className="w-4 h-4" />;
      case 'business':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'family':
        return 'Família';
      case 'business':
        return 'Trabalho';
      default:
        return 'Pessoal';
    }
  };

  return (
    <>
      <div
        onClick={() => !editing && onSelect()}
        className={cn(
          "relative rounded-2xl p-4 flex items-center gap-4 border-2 shadow-sm bg-card transition-all duration-300 cursor-pointer group",
          "hover:shadow-md hover:scale-[1.01]",
          selected
            ? "border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        {/* Indicador de selecionado */}
        <div 
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 shrink-0",
            selected 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
          )}
        >
          {selected ? (
            <Check className="w-5 h-5" />
          ) : (
            getTypeIcon()
          )}
        </div>

        {editing && setEditName && onSaveEdit ? (
          <div className="flex-1" onClick={(e) => e.stopPropagation()}>
            <WorkspaceNameEditField
              value={editName}
              onChange={setEditName}
              onSave={() => onSaveEdit(editName)}
              onCancel={onEdit}
            />
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    "font-semibold text-base md:text-lg truncate transition-colors",
                    selected ? "text-primary" : "text-foreground"
                  )}
                  title={name}
                >
                  {name}
                </span>
                {selected && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-0">
                    Ativo
                  </Badge>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTypeEditorOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group/type"
              >
                {getTypeIcon()}
                <span>{getTypeLabel()}</span>
                <Settings2 className="w-3 h-3 opacity-0 group-hover/type:opacity-100 transition-opacity" />
              </button>
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                size="icon"
                variant="ghost"
                onClick={onEdit}
                className="shrink-0 h-9 w-9 hover:bg-primary/10 hover:text-primary"
                aria-label="Editar nome"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                aria-label="Excluir workspace"
                onClick={onDelete}
                disabled={disableDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      <WorkspaceTypeEditor
        open={typeEditorOpen}
        onOpenChange={setTypeEditorOpen}
        workspaceId={id}
        workspaceName={name}
        currentType={type}
        onSuccess={() => {
          if (onReload) onReload();
        }}
      />
    </>
  );
}
