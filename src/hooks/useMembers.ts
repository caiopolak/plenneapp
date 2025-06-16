
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
  profiles?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

export function useMembers() {
  const { current } = useWorkspace();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!current) {
      setMembers([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    supabase
      .from("workspace_members")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq("workspace_id", current.id)
      .in("status", ["active", "invited"])
      .then(({ data }) => {
        setMembers(data || []);
        setLoading(false);
      });
  }, [current?.id]);

  return { members, loading };
}
