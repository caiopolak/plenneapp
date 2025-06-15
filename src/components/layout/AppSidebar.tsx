
import React from "react";
import {
  LayoutDashboard,
  Settings,
  Wallet,
  Activity,
  GraduationCap,
  MessageSquare,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { LogoPlenne } from "./LogoPlenne";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Slogans para sortear ao recarregar a página
const SLOGANS = [
  "Controle financeiro de verdade.",
  "Sua vida financeira, plena.",
  "Transforme seus sonhos em conquistas.",
  "Planeje, realize, viva melhor.",
  "Disciplina hoje, plenitude amanhã.",
  "Acompanhe. Evolua. Conquiste.",
];

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  const { signOut } = useAuth();
  const { profile, subscription } = useProfile();

  // Sorteia slogan uma vez por recarga
  const [slogan] = React.useState(() => {
    return SLOGANS[Math.floor(Math.random() * SLOGANS.length)];
  });

  // Menu items config
  const menuItems = [
    {
      key: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      key: "analytics",
      icon: Activity,
      label: "Análises",
    },
    {
      key: "education",
      icon: GraduationCap,
      label: "Educação",
    },
    {
      key: "whatsapp",
      icon: MessageSquare,
      label: "WhatsApp",
    },
    {
      key: "subscription",
      icon: Settings,
      label: "Assinatura",
    },
    {
      key: "profile",
      icon: UserIcon,
      label: "Perfil",
    },
  ];

  // Centralização e exibição de perfil + informações relevantes
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex flex-col items-center gap-3 pt-8 pb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
            <Avatar className="w-20 h-20 ring-2 ring-primary/60 shadow-lg mb-2">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || "Avatar"} />
              ) : (
                <AvatarFallback>
                  {profile?.full_name
                    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                    : <UserIcon className="w-10 h-10 text-muted-foreground" />}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col items-center w-full">
              <span className="font-display font-bold text-primary text-xl truncate max-w-[144px] block">{profile?.full_name || "Usuário"}</span>
              <span className="text-sm text-muted-foreground truncate max-w-[180px]">{profile?.email}</span>
              {subscription?.plan && (
                <span
                  className={`mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    subscription.plan === "business"
                      ? "bg-green-100 text-green-700"
                      : subscription.plan === "pro"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {subscription.plan === "business"
                    ? "Business"
                    : subscription.plan === "pro"
                    ? "Pro"
                    : "Free"}
                </span>
              )}
            </div>
          </div>
          {/* Logo + nome Plenne (com degradê) e slogan rotativo centralizado */}
          <div className="flex flex-col items-center gap-0 px-3 py-3 border-b border-primary/10">
            <LogoPlenne className="mb-1" />
            <span className="text-xs italic text-primary/80 text-center px-2 transition-all animate-fade-in font-medium max-w-[196px]">{slogan}</span>
          </div>
          <SidebarSeparator className="mb-1" />
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={activeTab === item.key}
                    onClick={() => setActiveTab(item.key)}
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          size="default"
          onClick={signOut}
          className="w-full flex items-center justify-start px-2"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

