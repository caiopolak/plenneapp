
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { safeLog } from "@/lib/security";

const WORKSPACE_STORAGE_KEY = "plenne_current_workspace_id";

interface Workspace {
  id: string;
  name: string;
  type?: string | null;
  owner_id?: string | null;
  subscription_id?: string | null;
  created_at?: string | null;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  current: Workspace | null;
  setCurrent: (w: Workspace | null) => void;
  reload: () => Promise<void>;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  current: null,
  setCurrent: () => {},
  reload: async () => {},
  isLoading: true,
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [current, setCurrentState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para definir o workspace atual e salvar no localStorage
  const setCurrent = useCallback(
    (w: Workspace | null) => {
      setCurrentState(w);

      // Persistência local (best-effort)
      try {
        if (w?.id) {
          localStorage.setItem(WORKSPACE_STORAGE_KEY, w.id);
          safeLog("info", "WorkspaceContext - Saved current workspace to localStorage", {
            workspaceId: w.id,
          });
        } else {
          localStorage.removeItem(WORKSPACE_STORAGE_KEY);
        }
      } catch (error) {
        safeLog("warn", "WorkspaceContext - localStorage not available", { error: String(error) });
      }

      // Persistência no servidor (para manter seleção ao trocar de página/dispositivo)
      // Obs: tabela profiles tem 1 linha por usuário, então guardamos o workspace ativo nela.
      if (user?.id) {
        supabase
          .from("profiles")
          .update({ workspace_id: w?.id ?? null })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) {
              safeLog("warn", "WorkspaceContext - Failed to persist workspace on profile", {
                error: error.message,
              });
            }
          });
      }
    },
    [user?.id]
  );

  const reload = useCallback(async () => {
    if (!user) {
      safeLog("info", "WorkspaceContext - No user, clearing workspaces");
      setWorkspaces([]);
      setCurrentState(null);
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    safeLog("info", "WorkspaceContext - Reloading workspaces for user", { userId: user.id });

    try {
      // Primeiro, buscar todos os workspace_ids onde o user é membro:
      const { data: memberRecords, error: memberError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .eq("status", "active");

      safeLog("info", "WorkspaceContext - Member records count", { count: memberRecords?.length || 0 });

      let workspaceIds: string[] = [];

      if (!memberError && memberRecords && memberRecords.length > 0) {
        workspaceIds = memberRecords.map((rec: any) => rec.workspace_id).filter(Boolean);
      }

      // Também buscar workspaces onde o usuário é owner (fallback)
      const { data: ownedWorkspaces, error: ownerError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id);

      if (!ownerError && ownedWorkspaces) {
        ownedWorkspaces.forEach(ws => {
          if (!workspaceIds.includes(ws.id)) {
            workspaceIds.push(ws.id);
          }
        });
      }

      safeLog("info", "WorkspaceContext - Combined workspace IDs", { count: workspaceIds.length });

      // Se não tem nenhum workspace, criar um padrão
      if (workspaceIds.length === 0) {
        safeLog("info", "WorkspaceContext - No workspaces found, creating default workspace");

        const { data: createdWorkspace, error: createWsError } = await supabase
          .from("workspaces")
          .insert({
            name: "Meu Workspace",
            type: "personal",
            owner_id: user.id,
          })
          .select("*")
          .single();

        if (createWsError || !createdWorkspace) {
          safeLog("error", "WorkspaceContext - Failed to create default workspace", {
            error: createWsError?.message,
          });
          setWorkspaces([]);
          setCurrentState(null);
          setIsLoading(false);
          return;
        }

        // Criar registro de membro para o novo workspace
        await supabase.from("workspace_members").insert({
          workspace_id: createdWorkspace.id,
          user_id: user.id,
          status: "active",
          role: "owner",
        });

        setWorkspaces([createdWorkspace]);
        setCurrent(createdWorkspace);
        setIsLoading(false);
        return;
      }

      // Buscar os workspaces usando os IDs encontrados
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .in("id", workspaceIds);

      safeLog("info", "WorkspaceContext - Workspaces loaded", { count: data?.length || 0 });

      if (!error && data && data.length > 0) {
        setWorkspaces(data);

        // Preferência: localStorage -> profiles.workspace_id -> primeiro da lista
        let savedWorkspaceId: string | null = null;
        try {
          savedWorkspaceId = localStorage.getItem(WORKSPACE_STORAGE_KEY);
        } catch {
          savedWorkspaceId = null;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("workspace_id")
          .eq("id", user.id)
          .maybeSingle();

        const preferredWorkspaceId = savedWorkspaceId || profileData?.workspace_id || null;
        const preferredWorkspace = preferredWorkspaceId
          ? data.find((w: any) => w.id === preferredWorkspaceId)
          : null;

        if (preferredWorkspace) {
          safeLog("info", "WorkspaceContext - Restoring preferred workspace", {
            workspaceId: preferredWorkspace.id,
            source: savedWorkspaceId ? "localStorage" : "profile",
          });
          setCurrentState(preferredWorkspace);
        } else {
          // Se o workspace salvo não existe mais, usar o primeiro da lista
          safeLog("info", "WorkspaceContext - Setting first workspace as current", { workspaceId: data[0]?.id });
          setCurrent(data[0]);
        }
      } else {
        safeLog("warn", "WorkspaceContext - Error or no workspaces", { error: error?.message });
        setWorkspaces([]);
        setCurrentState(null);
      }
    } catch (error) {
      safeLog("error", "WorkspaceContext - Error loading workspaces", { error: String(error) });
      setWorkspaces([]);
      setCurrentState(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, setCurrent]);

  useEffect(() => {
    reload();
  }, [user?.id, reload]);

  return (
    <WorkspaceContext.Provider value={{ workspaces, current, setCurrent, reload, isLoading }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
