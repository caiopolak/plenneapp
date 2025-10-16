
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
    if (!user) return;

    // Primeiro, buscar todos os workspace_ids onde o user é membro:
    const { data: memberRecords, error: memberError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (memberError || !memberRecords || memberRecords.length === 0) {
      setWorkspaces([]);
      setCurrent(null);
      return;
    }
    // Extrair array de IDs
    const workspaceIds = memberRecords.map((rec: any) => rec.workspace_id).filter(Boolean);

    if (workspaceIds.length === 0) {
      setWorkspaces([]);
      setCurrent(null);
      return;
    }

    // Buscar os workspaces usando os IDs encontrados
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .in("id", workspaceIds);

    if (!error && data) {
      setWorkspaces(data);
      setCurrent((c) => c && data.find((w: any) => w.id === c.id) ? c : data[0] || null);
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
