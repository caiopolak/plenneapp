import React from "react";
import { WorkspaceCard } from "./WorkspaceCard";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface Workspace {
  id: string;
  name: string;
  type?: string | null;
}

interface Props {
  workspaces: Workspace[];
  current: Workspace | null;
  editingId: string | null;
  editName: string;
  setEditName: (s: string) => void;
  setEditingId: (s: string | null) => void;
  handleSelectWorkspace: (id: string) => void;
  handleEditWorkspace: (id: string, name: string) => void;
  setDeleteTarget: (s: string | null) => void;
}

export function WorkspaceList({
  workspaces, current,
  editingId, editName, setEditName, setEditingId,
  handleSelectWorkspace, handleEditWorkspace, setDeleteTarget
}: Props) {
  const { reload } = useWorkspace();

  const onSelectWithFeedback = (id: string, name: string) => {
    handleSelectWorkspace(id);
    toast.success(`Workspace "${name}" selecionado!`, {
      description: "Todos os dados agora são deste workspace.",
      duration: 3000,
    });
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Clique em um workspace para selecioná-lo como ativo
        </p>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <ul className="space-y-3">
        {workspaces.map((ws) => (
          <li key={ws.id}>
            <WorkspaceCard
              id={ws.id}
              name={ws.name}
              type={ws.type}
              selected={current?.id === ws.id}
              onSelect={() => onSelectWithFeedback(ws.id, ws.name)}
              onEdit={() =>
                editingId === ws.id
                  ? setEditingId(null)
                  : (setEditingId(ws.id), setEditName(ws.name))
              }
              onDelete={() => setDeleteTarget(ws.id)}
              onSaveEdit={(value: string) => handleEditWorkspace(ws.id, value)}
              editing={editingId === ws.id}
              editName={editName}
              setEditName={setEditName}
              disableDelete={workspaces.length === 1}
              onReload={reload}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
