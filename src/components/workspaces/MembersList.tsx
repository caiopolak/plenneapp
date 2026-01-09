
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Crown, User, Mail } from "lucide-react";
import { WorkspaceMember } from "@/hooks/useWorkspaceMembers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MembersListProps {
  members: WorkspaceMember[];
  currentUserRole: string | null;
  canManageMembers: boolean;
  onRemoveMember: (memberId: string) => void;
  onChangeRole: (memberId: string, newRole: string) => void;
}

export function MembersList({
  members,
  currentUserRole,
  canManageMembers,
  onRemoveMember,
  onChangeRole
}: MembersListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary">Ativo</Badge>;
      case "invited":
        return <Badge variant="outline">Convidado</Badge>;
      default:
        return <Badge variant="destructive">Removido</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    return role === "admin" ? <Crown className="w-4 h-4 text-yellow-600" /> : <User className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <User className="w-5 h-5" />
        Membros do Workspace ({members.length})
      </h3>
      
      {members.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum membro encontrado neste workspace.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm"
            >
              <div className="flex items-center gap-3">
                {member.status === "invited" ? (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                ) : (
                  <Avatar>
                    {member.profiles?.avatar_url ? (
                      <AvatarImage src={member.profiles.avatar_url} />
                    ) : (
                      <AvatarFallback>
                        {member.profiles?.full_name
                          ? member.profiles.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                          : <User className="w-5 h-5" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {member.status === "invited" 
                        ? member.invited_email 
                        : member.profiles?.full_name || member.profiles?.email || "Usuário"}
                    </span>
                    {getRoleIcon(member.role)}
                  </div>
                  {member.status === "active" && member.profiles?.email && (
                    <span className="text-sm text-muted-foreground">
                      {member.profiles.email}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(member.status)}
                  </div>
                </div>
              </div>

              {canManageMembers && (
                <div className="flex items-center gap-2">
                  {member.status === "active" && (
                    <Select
                      value={member.role}
                      onValueChange={(newRole) => onChangeRole(member.id, newRole)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Membro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveMember(member.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
