import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Shield, CreditCard } from "lucide-react";

const ProfilePageNew = () => {
  const { profile, subscription, updateProfile, loading } = useProfile();
  const { toast } = useToast();

  // Form states
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [currency, setCurrency] = useState(profile?.currency || "BRL");
  const [riskProfile, setRiskProfile] = useState(profile?.risk_profile || "moderate");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);

  React.useEffect(() => {
    setFullName(profile?.full_name || "");
    setPhone(profile?.phone || "");
    setCurrency(profile?.currency || "BRL");
    setRiskProfile(profile?.risk_profile || "moderate");
    setAvatarUrl(profile?.avatar_url || "");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await updateProfile({
      full_name: fullName,
      phone,
      currency,
      risk_profile: riskProfile,
      avatar_url: avatarUrl,
    });
    if (!error) {
      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." });
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar perfil." });
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-[#f8961e] text-white';
      case 'business': return 'bg-[#2f9e44] text-white';
      default: return 'bg-[#003f5c] text-white';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight brand-gradient-text">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e preferências.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card de informações do usuário */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-tr from-white via-[#f8fffe] to-[#eaf6ee] border-none shadow-[0_4px_24px_0_rgba(0,63,92,0.13)]">
            <CardContent className="p-6 text-center space-y-4">
              <Avatar className="h-24 w-24 mx-auto border-4 border-white shadow-lg">
                <AvatarImage src={avatarUrl || ''} alt={fullName || ''} />
                <AvatarFallback className="bg-[#eaf6ee] text-[#003f5c] font-bold text-2xl">
                  {fullName?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-[#003f5c]">{fullName || 'Usuário'}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
              {subscription && (
                <Badge className={`${getPlanColor(subscription.plan)} text-sm font-bold`}>
                  Plano {subscription.plan.toUpperCase()}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Formulário de edição */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Pessoal
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferências
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Segurança
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="avatar">Avatar (URL)</Label>
                        <Input
                          id="avatar"
                          type="url"
                          value={avatarUrl || ""}
                          onChange={e => setAvatarUrl(e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="fullName">Nome completo</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="Seu nome"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          type="email" 
                          value={profile?.email || ''} 
                          disabled 
                          className="opacity-60" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="(99) 99999-9999"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      Salvar Alterações
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currency">Moeda padrão</Label>
                    <select
                      id="currency"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                    >
                      <option value="BRL">Real (BRL)</option>
                      <option value="USD">Dólar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="riskProfile">Perfil de investimento</Label>
                    <select
                      id="riskProfile"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      value={riskProfile}
                      onChange={e => setRiskProfile(e.target.value as any)}
                    >
                      <option value="conservative">Conservador</option>
                      <option value="moderate">Moderado</option>
                      <option value="aggressive">Agressivo</option>
                    </select>
                  </div>
                  <Button 
                    onClick={() => {
                      updateProfile({ currency, risk_profile: riskProfile });
                      toast({ title: "Preferências salvas!" });
                    }} 
                    className="w-full"
                  >
                    Salvar Preferências
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Para alterar sua senha ou configurações de segurança, utilize as opções de autenticação do Supabase.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Alterar Senha
                    </Button>
                    <Button variant="outline" className="w-full">
                      Configurar 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageNew;