
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

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
      console.log("WorkspaceContext - No user, clearing workspaces");
      setWorkspaces([]);
      setCurrent(null);
      return;
    }

    console.log("WorkspaceContext - Reloading workspaces for user:", user.id);

    // Primeiro, buscar todos os workspace_ids onde o user é membro:
    const { data: memberRecords, error: memberError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    console.log("WorkspaceContext - Member records:", memberRecords);

    if (memberError || !memberRecords || memberRecords.length === 0) {
      console.log("WorkspaceContext - No workspace members found, trying fallback to owner workspaces");
      
      // Fallback: try to load workspaces where user is owner
      const { data: ownedWorkspaces, error: ownerError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id);

      if (!ownerError && ownedWorkspaces && ownedWorkspaces.length > 0) {
        console.log("WorkspaceContext - Found owner workspaces:", ownedWorkspaces);
        setWorkspaces(ownedWorkspaces);
        setCurrent(ownedWorkspaces[0]);
        return;
      }

      console.log("WorkspaceContext - No workspaces found at all");
      setWorkspaces([]);
      setCurrent(null);
      return;
    }
    // Extrair array de IDs
    const workspaceIds = memberRecords.map((rec: any) => rec.workspace_id).filter(Boolean);

    console.log("WorkspaceContext - Workspace IDs:", workspaceIds);

    if (workspaceIds.length === 0) {
      console.log("WorkspaceContext - No valid workspace IDs");
      setWorkspaces([]);
      setCurrent(null);
      return;
    }

    // Buscar os workspaces usando os IDs encontrados
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .in("id", workspaceIds);

    console.log("WorkspaceContext - Workspaces loaded:", data);

    if (!error && data && data.length > 0) {
      setWorkspaces(data);
      // Se não houver workspace atual OU o atual não está mais na lista, selecionar o primeiro
      const newCurrent = current && data.find((w: any) => w.id === current.id) ? current : data[0];
      console.log("WorkspaceContext - Setting current workspace to:", newCurrent);
      setCurrent(newCurrent);
    } else {
      console.log("WorkspaceContext - Error or no workspaces:", error);
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
