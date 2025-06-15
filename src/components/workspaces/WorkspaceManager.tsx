
import React, { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Check, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

export function WorkspaceManager() {
  const { workspaces, current, setCurrent, reload } = useWorkspace();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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

  async function handleDeleteWorkspace(id: string) {
    await supabase.from("workspaces").delete().eq("id", id);
    setDeleteTarget(null);
    reload();
    toast({ title: "Workspace removido com sucesso." });
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
        <Info className="text-blue-500 mt-1" />
        <div>
          <p className="font-semibold text-blue-800 mb-1">O que são Workspaces?</p>
          <p className="text-sm text-blue-700">
            Os workspaces permitem organizar suas finanças familiares, profissionais ou pessoais em diferentes ambientes. Você pode criar vários workspaces para separar suas contas, gerenciar membros e compartilhar informações de forma segura e independente. Adicione, edite ou remova workspaces de acordo com suas necessidades.
          </p>
        </div>
      </div>

      <h1 className="text-3xl font-extrabold font-display brand-gradient-text mb-6 text-center">
        Workspaces
      </h1>
      {workspaces.length === 0 ? (
        <div className="text-center my-10">
          <p className="mb-6 text-muted-foreground">
            Você ainda não possui nenhum workspace.
            <br />
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
          <ul className="space-y-4 mb-6">
            {workspaces.map((ws) => (
              <li
                key={ws.id}
                className={`rounded-xl p-4 flex items-center gap-4 border shadow transition relative bg-gradient-to-r from-blue-100/70 via-white to-green-100/80 ${
                  current?.id === ws.id
                    ? "border-primary/70 bg-gradient-to-r from-blue-200 to-green-100 shadow-lg"
                    : "border-muted"
                }`}
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
                    <Button
                      size="sm"
                      className="ml-2"
                      onClick={() => handleEditWorkspace(ws.id)}
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-2"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-primary text-lg truncate" title={ws.name}>
                      {ws.name}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(ws.id);
                        setEditName(ws.name);
                      }}
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
                      onClick={() => setDeleteTarget(ws.id)}
                      disabled={workspaces.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
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
        </>
      )}

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este workspace? Esta ação <b>não poderá ser desfeita</b> e todos os dados relacionados serão apagados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => handleDeleteWorkspace(deleteTarget!)}
            >Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// O componente está ficando extenso. Considere pedir um refatoramento para separá-lo em arquivos menores para facilitar a manutenção.
