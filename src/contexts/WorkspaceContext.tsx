
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { safeLog } from "@/lib/security";

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
  reload: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  current: null,
  setCurrent: () => {},
  reload: () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [current, setCurrent] = useState<Workspace | null>(null);

  const reload = async () => {
    if (!user) {
      safeLog("info", "WorkspaceContext - No user, clearing workspaces");
      setWorkspaces([]);
      setCurrent(null);
      return;
    }

    safeLog("info", "WorkspaceContext - Reloading workspaces for user", { userId: user.id });

    // Primeiro, buscar todos os workspace_ids onde o user é membro:
    const { data: memberRecords, error: memberError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    safeLog("info", "WorkspaceContext - Member records count", { count: memberRecords?.length || 0 });

    if (memberError || !memberRecords || memberRecords.length === 0) {
      safeLog("info", "WorkspaceContext - No workspace members found, trying fallback to owner workspaces");

      // Fallback: try to load workspaces where user is owner
      const { data: ownedWorkspaces, error: ownerError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id);

      if (!ownerError && ownedWorkspaces && ownedWorkspaces.length > 0) {
        safeLog("info", "WorkspaceContext - Found owner workspaces", { count: ownedWorkspaces.length });
        setWorkspaces(ownedWorkspaces);
        setCurrent(ownedWorkspaces[0]);
        return;
      }

      // If the user has no workspaces at all, provision a default personal workspace.
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
        setCurrent(null);
        return;
      }

      // Ensure the user is registered as an active member of the workspace too.
      const { error: createMemberError } = await supabase.from("workspace_members").insert({
        workspace_id: createdWorkspace.id,
        user_id: user.id,
        status: "active",
        role: "owner",
      });

      if (createMemberError) {
        safeLog("warn", "WorkspaceContext - Created workspace but failed to create member record", {
          error: createMemberError.message,
        });
      }

      setWorkspaces([createdWorkspace]);
      setCurrent(createdWorkspace);
      return;
    }
    // Extrair array de IDs
    const workspaceIds = memberRecords.map((rec: any) => rec.workspace_id).filter(Boolean);

    safeLog("info", "WorkspaceContext - Workspace IDs count", { count: workspaceIds.length });

    if (workspaceIds.length === 0) {
      safeLog("info", "WorkspaceContext - No valid workspace IDs");
      setWorkspaces([]);
      setCurrent(null);
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
      // Se não houver workspace atual OU o atual não está mais na lista, selecionar o primeiro
      const newCurrent = current && data.find((w: any) => w.id === current.id) ? current : data[0];
      safeLog("info", "WorkspaceContext - Setting current workspace", { workspaceId: newCurrent?.id });
      setCurrent(newCurrent);
    } else {
      safeLog("warn", "WorkspaceContext - Error or no workspaces", { error: error?.message });
      setWorkspaces([]);
      setCurrent(null);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line
  }, [user?.id]);

  return (
    <WorkspaceContext.Provider value={{ workspaces, current, setCurrent, reload }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
