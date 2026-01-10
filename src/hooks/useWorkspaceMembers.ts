
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
        .select("*")
        .eq("workspace_id", current.id)
        .in("status", ["active", "invited"]);

      if (error) throw error;
      
      if (!data) {
        setMembers([]);
        setCurrentUserRole(null);
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

      // Criar convite no banco
      const { error } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: current.id,
          invited_email: email.toLowerCase(),
          role,
          status: "invited"
        });

      if (error) throw error;

      // Buscar nome do usuário que está convidando
      const { data: inviterProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      // Enviar email de convite via edge function
      const { error: emailError } = await supabase.functions.invoke("send-workspace-invite", {
        body: {
          invitedEmail: email.toLowerCase(),
          workspaceName: current.name,
          inviterName: inviterProfile?.full_name || user.email || "Um usuário",
          role,
          workspaceId: current.id
        }
      });

      if (emailError) {
        console.error("Erro ao enviar email:", emailError);
        // Não falhar o convite se o email falhar, apenas avisar
        toast({
          title: "Convite criado",
          description: `O convite foi registrado, mas houve um problema ao enviar o email para ${email}. O usuário poderá aceitar ao fazer login.`
        });
      } else {
        toast({
          title: "Convite enviado!",
          description: `O email de convite foi enviado para ${email}.`
        });
      }

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
