
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
  SidebarGroupLabel,
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

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  const { signOut } = useAuth();
  const { profile } = useProfile();

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

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          {/* Avatar + Nome do usuário */}
          <div className="flex flex-col items-center py-6 gap-2 bg-gradient-to-r from-primary/10 to-secondary/10">
            <Avatar className="w-16 h-16 ring-2 ring-primary/60 shadow-lg">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || "Avatar"} />
              ) : (
                <AvatarFallback>
                  {profile?.full_name
                    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                    : <UserIcon className="w-7 h-7 text-muted-foreground" />}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center">
              <span className="font-display font-bold text-primary text-lg truncate max-w-[122px] block">{profile?.full_name || "Usuário"}</span>
              <span className="text-xs text-muted-foreground">{profile?.email}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-3">
            {/* Nome apenas "Plenne" (sem logo) */}
            <span className="text-2xl font-bold text-primary pl-0">Plenne</span>
            <span className="slogan text-xs font-medium text-primary/80">
              Controle financeiro de verdade.
            </span>
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
