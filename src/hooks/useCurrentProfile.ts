
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCurrentProfile() {
  const { user } = useAuth();
  const { current } = useWorkspace();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user || !current) {
      setProfile(null);
      return;
    }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .eq("workspace_id", current.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user?.id, current?.id]);

  return profile;
}
