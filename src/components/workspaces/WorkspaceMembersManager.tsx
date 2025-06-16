
import React from "react";
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers";
import { MembersList } from "./MembersList";
import { InviteMemberForm } from "./InviteMemberForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, Shield } from "lucide-react";

export function WorkspaceMembersManager() {
  const {
    members,
    loading,
    currentUserRole,
    canManageMembers,
    inviteMember,
    removeMember,
    changeMemberRole
  } = useWorkspaceMembers();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestão de Membros
          </CardTitle>
          {currentUserRole && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              Seu papel: <strong>{currentUserRole === "admin" ? "Administrador" : "Membro"}</strong>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <InviteMemberForm 
            onInvite={inviteMember}
            canInvite={canManageMembers}
          />
          
          <Separator />
          
          <MembersList
            members={members}
            currentUserRole={currentUserRole}
            canManageMembers={canManageMembers}
            onRemoveMember={removeMember}
            onChangeRole={changeMemberRole}
          />
        </CardContent>
      </Card>
    </div>
  );
}
