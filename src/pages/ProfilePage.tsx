
import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { profile, updateProfile, loading } = useProfile();
  const { toast } = useToast();

  // Form states
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [email] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [currency, setCurrency] = useState(profile?.currency || "BRL");
  const [riskProfile, setRiskProfile] = useState(profile?.risk_profile || "moderate");
  // Notificaçao simplificada para exemplo
  const [notificationPreferences, setNotificationPreferences] = useState(
    profile?.notification_preferences
  );
  // Para avatar, somente preview
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);

  React.useEffect(() => {
    setFullName(profile?.full_name || "");
    setPhone(profile?.phone || "");
    setCurrency(profile?.currency || "BRL");
    setRiskProfile(profile?.risk_profile || "moderate");
    setNotificationPreferences(profile?.notification_preferences);
    setAvatarUrl(profile?.avatar_url || "");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await updateProfile({
      full_name: fullName,
      phone,
      currency,
      risk_profile: riskProfile,
      notification_preferences: notificationPreferences,
      avatar_url: avatarUrl,
    });
    if (!error) {
      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." });
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar perfil." });
    }
  };

  return (
    <div className="flex justify-center py-10 px-2 animate-fade-in">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 flex flex-col">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <Avatar>
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Avatar" />
                ) : (
                  <AvatarFallback>
                    {fullName ? fullName[0] : "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Avatar</label>
                <Input
                  type="text"
                  value={avatarUrl || ""}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="URL do Avatar (ex: https://...)"
                  className="w-60"
                />
                {/* Futuramente: opção de upload direto */}
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Nome completo</label>
              <Input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Email</label>
              <Input type="email" value={email} disabled className="opacity-60" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Telefone</label>
              <Input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(99) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Moeda</label>
              <select
                className="input px-3 py-2 rounded-md border border-input bg-background w-32"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="BRL">Real (BRL)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Perfil de risco</label>
              <select
                className="input px-3 py-2 rounded-md border border-input bg-background w-40"
                value={riskProfile}
                onChange={e => setRiskProfile(e.target.value as any)}
              >
                <option value="conservative">Conservador</option>
                <option value="moderate">Moderado</option>
                <option value="aggressive">Agressivo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Notificações</label>
              <select
                className="input px-3 py-2 rounded-md border border-input bg-background w-40"
                value={notificationPreferences?.push ? "push" : "email"}
                onChange={e =>
                  setNotificationPreferences({
                    ...notificationPreferences,
                    push: e.target.value === "push",
                    email: e.target.value === "email",
                  })
                }
              >
                <option value="push">Push no app</option>
                <option value="email">Por Email</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              Salvar alterações
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
