
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export interface Member {
  id: string;
  user_id: string | null;
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
      .select("*")
      .eq("workspace_id", current.id)
      .in("status", ["active", "invited"])
      .then(async ({ data }) => {
        if (!data) {
          setMembers([]);
          setLoading(false);
          return;
        }

        // Get profile data for members who have user_id
        const userIds = data.filter(member => member.user_id).map(member => member.user_id);
        let profilesData: any[] = [];
        
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .in("id", userIds);
          profilesData = profiles || [];
        }

        // Merge member data with profile data
        const membersWithProfiles = data.map(member => ({
          ...member,
          profiles: member.user_id 
            ? profilesData.find(profile => profile.id === member.user_id) || null
            : null
        }));

        setMembers(membersWithProfiles);
        setLoading(false);
      });
  }, [current?.id]);

  return { members, loading };
}
