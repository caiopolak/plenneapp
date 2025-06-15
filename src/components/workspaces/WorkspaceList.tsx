
import React from "react";
import { WorkspaceCard } from "./WorkspaceCard";

interface Props {
  workspaces: Array<any>;
  current: any;
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
  return (
    <ul className="space-y-4 mb-7">
      {workspaces.map((ws) => (
        <li key={ws.id}>
          <WorkspaceCard
            name={ws.name}
            selected={current?.id === ws.id}
            onSelect={() => handleSelectWorkspace(ws.id)}
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
          />
        </li>
      ))}
    </ul>
  );
}
