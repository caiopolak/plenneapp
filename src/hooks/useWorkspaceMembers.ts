
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface WorkspaceMember {
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

export function useWorkspaceMembers() {
  const { current } = useWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // Função para buscar membros
  const fetchMembers = async () => {
    if (!current?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
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
        .in("status", ["active", "invited"]);

      if (error) throw error;
      
      setMembers(data || []);
      
      // Determinar role do usuário atual
      const currentMember = data?.find(m => m.user_id === user?.id);
      setCurrentUserRole(currentMember?.role || null);
    } catch (error) {
      console.error("Erro ao buscar membros:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os membros do workspace."
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para convidar membro
  const inviteMember = async (email: string, role: string = "member") => {
    if (!current?.id || !user?.id) return false;
    
    try {
      // Verificar se já existe convite para este email
      const { data: existingInvite } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", current.id)
        .eq("invited_email", email.toLowerCase())
        .in("status", ["active", "invited"])
        .maybeSingle();

      if (existingInvite) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Este e-mail já foi convidado ou já é membro."
        });
        return false;
      }

      // Criar convite
      const { error } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: current.id,
          invited_email: email.toLowerCase(),
          role,
          status: "invited"
        });

      if (error) throw error;

      toast({
        title: "Convite enviado!",
        description: `O convite foi enviado para ${email}.`
      });

      await fetchMembers();
      return true;
    } catch (error) {
      console.error("Erro ao convidar membro:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar o convite."
      });
      return false;
    }
  };

  // Função para remover membro
  const removeMember = async (memberId: string) => {
    if (!current?.id) return false;

    try {
      const { error } = await supabase
        .from("workspace_members")
        .update({ status: "removed" })
        .eq("id", memberId)
        .eq("workspace_id", current.id);

      if (error) throw error;

      toast({
        title: "Membro removido",
        description: "O membro foi removido do workspace."
      });

      await fetchMembers();
      return true;
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o membro."
      });
      return false;
    }
  };

  // Função para alterar role do membro
  const changeMemberRole = async (memberId: string, newRole: string) => {
    if (!current?.id) return false;

    try {
      const { error } = await supabase
        .from("workspace_members")
        .update({ role: newRole })
        .eq("id", memberId)
        .eq("workspace_id", current.id);

      if (error) throw error;

      toast({
        title: "Permissão alterada",
        description: "As permissões do membro foram atualizadas."
      });

      await fetchMembers();
      return true;
    } catch (error) {
      console.error("Erro ao alterar permissão:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar as permissões."
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [current?.id, user?.id]);

  const isAdmin = currentUserRole === "admin";
  const canManageMembers = isAdmin;

  return {
    members,
    loading,
    currentUserRole,
    isAdmin,
    canManageMembers,
    inviteMember,
    removeMember,
    changeMemberRole,
    refetch: fetchMembers
  };
}
