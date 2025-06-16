
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InviteMemberFormProps {
  onInvite: (email: string, role: string) => Promise<boolean>;
  canInvite: boolean;
}

export function InviteMemberForm({ onInvite, canInvite }: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !canInvite) return;

    setLoading(true);
    const success = await onInvite(email.trim(), role);
    if (success) {
      setEmail("");
      setRole("member");
    }
    setLoading(false);
  };

  if (!canInvite) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Apenas administradores podem convidar novos membros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <UserPlus className="w-5 h-5" />
        Convidar Novo Membro
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail do convidado</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Digite o e-mail..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Membro</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button type="submit" disabled={!email.trim() || loading}>
          {loading ? "Enviando..." : "Enviar Convite"}
        </Button>
      </form>
      
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Como funciona:</strong> O convite será enviado por e-mail. 
          Se a pessoa não tiver conta no Plenne, precisará criar uma com este e-mail. 
          Após o cadastro, terá acesso automático a este workspace.
        </p>
      </div>
    </div>
  );
}
