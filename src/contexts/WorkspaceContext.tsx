
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface Workspace {
  id: string;
  name: string;
  type: string;
  owner_id: string;
  subscription_id: string | null;
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
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .in(
        "id",
        supabase
          .from("workspace_members")
          .select("workspace_id")
          .eq("user_id", user.id)
      );
    if (!error && data) {
      setWorkspaces(data);
      setCurrent((c) => c && data.find((w) => w.id === c.id) ? c : data[0] || null);
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
