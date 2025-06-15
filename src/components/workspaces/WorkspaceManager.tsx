
import React, { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function WorkspaceManager() {
  const { workspaces, current, setCurrent, reload } = useWorkspace();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  // Trocar workspace ativo
  function handleSelectWorkspace(id: string) {
    const w = workspaces.find((ws) => ws.id === id) || null;
    setCurrent(w);
  }

  // Criar novo workspace
  async function handleCreateWorkspace() {
    if (!newName.trim() || !user) return;
    // owner_id deve ser preenchido para passar nas policies RLS
    const res = await supabase
      .from("workspaces")
      .insert([{ name: newName.trim(), type: "personal", owner_id: user.id }])
      .select()
      .single();
    if (!res.error) {
      setNewName("");
      setCreating(false);
      reload();
      toast({ title: "Workspace criada com sucesso!" });
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar o workspace." });
    }
  }

  // Editar nome do workspace
  async function handleEditWorkspace(id: string) {
    if (!editName.trim()) return;
    await supabase
      .from("workspaces")
      .update({ name: editName.trim() })
      .eq("id", id);
    setEditingId(null);
    setEditName("");
    reload();
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-extrabold font-display brand-gradient-text mb-6 text-center">Workspaces</h1>
      <ul className="space-y-4 mb-6">
        {workspaces.map((ws) => (
          <li
            key={ws.id}
            className={`rounded-lg p-4 flex items-center gap-4 border transition ${current?.id === ws.id ? "border-primary/60 bg-primary/5 shadow" : "border-muted bg-background"}`}
          >
            <Button
              variant={current?.id === ws.id ? "secondary" : "ghost"}
              className="w-8 h-8 rounded-full mr-2"
              onClick={() => handleSelectWorkspace(ws.id)}
              aria-label="Selecionar workspace"
            >
              <Check className="w-4 h-4" />
            </Button>
            {editingId === ws.id ? (
              <>
                <Input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="max-w-[180px]"
                />
                <Button size="sm" className="ml-2" onClick={() => handleEditWorkspace(ws.id)}>Salvar</Button>
                <Button size="sm" variant="destructive" className="ml-2" onClick={() => setEditingId(null)}>Cancelar</Button>
              </>
            ) : (
              <>
                <span className="flex-1 font-medium text-primary text-lg">{ws.name}</span>
                <Button size="icon" variant="ghost" onClick={() => { setEditingId(ws.id); setEditName(ws.name); }} className="shrink-0">
                  <Pencil className="w-4 h-4" />
                </Button>
                {/* Excluir só para admin/dono futuramente */}
              </>
            )}
          </li>
        ))}
      </ul>
      {creating ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder="Nome do novo workspace"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="max-w-[200px]"
          />
          <Button variant="secondary" onClick={handleCreateWorkspace}>Criar</Button>
          <Button variant="ghost" onClick={() => { setCreating(false); setNewName(""); }}>Cancelar</Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setCreating(true)} className="flex gap-2">
          <Plus className="w-4 h-4" /> Adicionar workspace
        </Button>
      )}
    </div>
  );
}
