
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

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  const { signOut } = useAuth();

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
          <div className="flex items-center gap-2 px-3 py-3">
            <LogoPlenne />
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
