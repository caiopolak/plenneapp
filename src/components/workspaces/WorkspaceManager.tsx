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

export function WorkspaceManager() {
  const { workspaces, current, setCurrent, reload } = useWorkspace();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
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
          type: "personal",
          owner_id: user.id,
        },
      ])
      .select()
      .single();
    if (!res.error) {
      setNewName("");
      setCreating(false);
      reload();
      toast({ title: "Workspace criada com sucesso!" });
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: res.error.message || "Não foi possível criar o workspace.",
      });
    }
  }

  async function handleEditWorkspace(id: string, value: string) {
    if (!value.trim()) return;
    await supabase
      .from("workspaces")
      .update({ name: value.trim() })
      .eq("id", id);
    setEditingId(null);
    setEditName("");
    reload();
  }

  // Correção: deleção confiável com loading, logs, e validação
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
    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    setDeleting(false);
    setDeleteTarget(null);
    if (error) {
      console.error("Erro ao deletar workspace:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message || "Não foi possível deletar o workspace.",
      });
      return;
    }
    reload();
    toast({ title: "Workspace removido com sucesso." });
  }

  // Info esclarecedor
  const infoText = (
    <>
      <p className="font-semibold text-blue-800 mb-1">O que são Workspaces?</p>
      <p className="text-sm text-blue-700">
        <span className="block mb-1">
          <b>Workspaces</b> são ambientes organizados para separar diferentes conjuntos de informações e finanças dentro do Plenne.
        </span>
        • Use um workspace para separar suas contas pessoais, familiares ou de trabalho.<br />
        • Cada workspace tem membros, contas e dados independentes.<br />
        <br />
        <b>Edição & exclusão:</b> Clique no lápis para editar o nome ou no lixo para excluir.<br />
        <span className="text-red-700 font-semibold">
          Atenção: só é possível excluir workspaces extras e <b>todos os dados desse workspace serão apagados</b>.
        </span>
      </p>
    </>
  );

  return (
    <div className="max-w-xl mx-auto py-10 px-2 md:px-4">
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2 shadow">
        <Info className="text-blue-500 mt-1 shrink-0" />
        <div>{infoText}</div>
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text mb-5 text-center">
        Workspaces
      </h1>
      {workspaces.length === 0 ? (
        <div className="text-center my-10">
          <p className="mb-6 text-muted-foreground">
            Você ainda não possui nenhum workspace.<br />
            Crie seu primeiro workspace para começar a organizar suas finanças!
          </p>
          {creating ? (
            <div className="flex justify-center gap-2">
              <Input
                autoFocus
                placeholder="Nome do novo workspace"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="max-w-[200px]"
              />
              <Button
                variant="secondary"
                onClick={handleCreateWorkspace}
                disabled={!newName.trim()}
              >
                Criar
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCreating(false);
                  setNewName("");
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreating(true)}
              className="flex gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" /> Adicionar workspace
            </Button>
          )}
        </div>
      ) : (
        <>
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
          {creating ? (
            <div className="flex gap-2">
              <Input
                autoFocus
                placeholder="Nome do novo workspace"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="max-w-[200px]"
              />
              <Button
                variant="secondary"
                onClick={handleCreateWorkspace}
                disabled={!newName.trim()}
              >
                Criar
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCreating(false);
                  setNewName("");
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreating(true)}
              className="flex gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar workspace
            </Button>
          )}
          {/* Confirmação de exclusão */}
          <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir workspace?</AlertDialogTitle>
                <AlertDialogDescription>
                  ⚠️ Tem certeza que deseja remover este workspace?
                  <br />
                  Esta ação <b>não poderá ser desfeita</b> e todos os dados relacionados serão apagados permanentemente.<br />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleDeleteWorkspace(deleteTarget)}
                  disabled={deleting}
                >
                  {deleting ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}

// O componente está ficando extenso. Considere pedir um refatoramento para separá-lo em arquivos menores para facilitar a manutenção.
