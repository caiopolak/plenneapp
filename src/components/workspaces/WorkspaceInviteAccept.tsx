
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Users, Mail } from "lucide-react";
import { safeLog } from "@/lib/security";

interface PendingInvite {
  id: string;
  workspace_id: string;
  role: string;
  created_at: string;
  workspaces: {
    name: string;
    type: string;
  };
}

export function WorkspaceInviteAccept() {
  const { user } = useAuth();
  const { reload } = useWorkspace();
  const { toast } = useToast();
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingInvite, setProcessingInvite] = useState<string | null>(null);

  // Buscar convites pendentes
  const fetchPendingInvites = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from("workspace_members")
        .select(`
          id,
          workspace_id,
          role,
          created_at,
          workspaces:workspace_id (
            name,
            type
          )
        `)
        .eq("invited_email", user.email.toLowerCase())
        .eq("status", "invited")
        .is("user_id", null);

      if (error) throw error;
      setPendingInvites(data || []);
    } catch (error) {
      safeLog('error', 'Erro ao buscar convites', { error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Aceitar convite
  const acceptInvite = async (inviteId: string) => {
    if (!user?.id) return;

    setProcessingInvite(inviteId);
    try {
      const { error } = await supabase
        .from("workspace_members")
        .update({
          user_id: user.id,
          status: "active"
        })
        .eq("id", inviteId);

      if (error) throw error;

      toast({
        title: "Convite aceito!",
        description: "Você agora faz parte do workspace."
      });

      await fetchPendingInvites();
      await reload(); // Recarrega workspaces para mostrar o novo
    } catch (error) {
      safeLog('error', 'Erro ao aceitar convite', { error: String(error) });
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível aceitar o convite."
      });
    } finally {
      setProcessingInvite(null);
    }
  };

  // Recusar convite
  const declineInvite = async (inviteId: string) => {
    setProcessingInvite(inviteId);
    try {
      const { error } = await supabase
        .from("workspace_members")
        .update({ status: "removed" })
        .eq("id", inviteId);

      if (error) throw error;

      toast({
        title: "Convite recusado",
        description: "O convite foi recusado."
      });

      await fetchPendingInvites();
    } catch (error) {
      safeLog('error', 'Erro ao recusar convite', { error: String(error) });
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível recusar o convite."
      });
    } finally {
      setProcessingInvite(null);
    }
  };

  useEffect(() => {
    fetchPendingInvites();
  }, [user?.email]);

  if (loading) {
    return null; // Não mostrar loading para este componente
  }

  if (pendingInvites.length === 0) {
    return null; // Não mostrar se não há convites
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Mail className="w-5 h-5" />
          Convites Pendentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingInvites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-medium">{invite.workspaces.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    {invite.role === "admin" ? "Administrador" : "Membro"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Convidado em {new Date(invite.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => acceptInvite(invite.id)}
                disabled={processingInvite === invite.id}
                className="bg-green-600 hover:bg-green-700"
              >
                {processingInvite === invite.id ? "Aceitando..." : "Aceitar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => declineInvite(invite.id)}
                disabled={processingInvite === invite.id}
              >
                Recusar
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
