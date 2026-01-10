
import React, { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Check, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { WorkspaceCard } from "./WorkspaceCard";
import { WorkspaceInfoBox } from "./WorkspaceInfoBox";
import { WorkspaceCreateForm } from "./WorkspaceCreateForm";
import { WorkspaceList } from "./WorkspaceList";
import { WorkspaceDeleteDialog } from "./WorkspaceDeleteDialog";
import { WorkspaceMembersManager } from "./WorkspaceMembersManager";
import { WorkspaceInviteAccept } from "./WorkspaceInviteAccept";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WorkspaceManager() {
  const { workspaces, current, setCurrent, reload } = useWorkspace();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("personal");
  const [editName, setEditName] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleSelectWorkspace(id: string) {
    const w = workspaces.find((ws) => ws.id === id) || null;
    setCurrent(w);
  }

  async function handleCreateWorkspace() {
    if (!newName.trim() || !user) return;
    const res = await supabase
      .from("workspaces")
      .insert([
        {
          name: newName.trim(),
          type: newType,
          owner_id: user.id,
        },
      ])
      .select()
      .single();
    if (!res.error && res.data) {
      setNewName("");
      setNewType("personal");
      setCreating(false);
      await reload();
      toast({ title: `Workspace "${newName}" criado com sucesso!`, description: `Tipo: ${newType === 'personal' ? 'Pessoal' : newType === 'family' ? 'Família' : 'Empresa'}` });
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: res.error?.message || "Não foi possível criar o workspace.",
      });
    }
  }

  async function handleEditWorkspace(id: string, value: string) {
    if (!value.trim()) return;
    const { error, data } = await supabase
      .from("workspaces")
      .update({ name: value.trim() })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error || !data) {
      toast({
        variant: "destructive",
        title: "Erro ao editar workspace",
        description: error?.message || "Não foi possível editar o workspace.",
      });
      setEditingId(null);
      setEditName("");
      return;
    }
    setEditingId(null);
    setEditName("");
    await reload();
    toast({ title: "Workspace editada com sucesso!" });
  }

  async function handleDeleteWorkspace(id: string | null) {
    if (!id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Workspace não selecionado ou já removido.",
      });
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    console.log("-- Tentando deletar workspace --", id);

    // Corrigido: deletar e checar por erro apenas
    const { error, data } = await supabase
      .from("workspaces")
      .delete()
      .eq("id", id);

    console.log("-- Resultado do delete workspace --", { error, data });

    if (error) {
      console.error("Erro ao deletar workspace:", error.message || error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Não foi possível deletar o workspace.",
      });
      setDeleting(false);
      return;
    }

    // Sucesso (se não houve erro)
    await reload();
    setDeleting(false);
    setDeleteTarget(null);
    toast({ title: "Workspace removido com sucesso." });
    console.log("-- Workspace deletado e lista recarregada --");
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-2 md:px-4">
      <WorkspaceInviteAccept />
      
      <WorkspaceInfoBox />
      
      <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text mb-5 text-center">
        Workspaces
      </h1>

      {workspaces.length === 0 ? (
        <div className="text-center my-10">
          <p className="mb-6 text-muted-foreground">
            Você ainda não possui nenhum workspace.<br />
            Crie seu primeiro workspace para começar a organizar suas finanças!
          </p>
          <WorkspaceCreateForm
            creating={creating}
            newName={newName}
            setNewName={setNewName}
            newType={newType}
            setNewType={setNewType}
            onCreate={handleCreateWorkspace}
            onCancel={() => {
              setCreating(false);
              setNewName("");
              setNewType("personal");
            }}
            setCreating={setCreating}
          />
        </div>
      ) : (
        <Tabs defaultValue="workspaces" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workspaces">Meus Workspaces</TabsTrigger>
            <TabsTrigger value="members">Gerenciar Membros</TabsTrigger>
          </TabsList>
          
          <TabsContent value="workspaces" className="space-y-6">
            <WorkspaceList
              workspaces={workspaces}
              current={current}
              editingId={editingId}
              editName={editName}
              setEditName={setEditName}
              setEditingId={setEditingId}
              handleSelectWorkspace={handleSelectWorkspace}
              handleEditWorkspace={handleEditWorkspace}
              setDeleteTarget={setDeleteTarget}
            />
            <WorkspaceCreateForm
              creating={creating}
              newName={newName}
              setNewName={setNewName}
              newType={newType}
              setNewType={setNewType}
              onCreate={handleCreateWorkspace}
              onCancel={() => {
                setCreating(false);
                setNewName("");
                setNewType("personal");
              }}
              setCreating={setCreating}
            />
            <WorkspaceDeleteDialog
              open={!!deleteTarget}
              onOpenChange={() => setDeleteTarget(null)}
              onDelete={() => handleDeleteWorkspace(deleteTarget)}
              disabled={deleting}
            />
          </TabsContent>
          
          <TabsContent value="members">
            {current ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Gerenciando: <span className="text-primary">{current.name}</span>
                  </h2>
                </div>
                <WorkspaceMembersManager />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Selecione um workspace para gerenciar seus membros.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
