
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export interface Member {
  id: string;
  user_id: string;
  role: string;
  invited_email: string | null;
  status: string;
  created_at: string;
}

export function useMembers() {
  const { current } = useWorkspace();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!current) return;
    setLoading(true);
    supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", current.id)
      .then(({ data }) => {
        setMembers(data || []);
        setLoading(false);
      });
  }, [current?.id]);

  return { members, loading };
}
