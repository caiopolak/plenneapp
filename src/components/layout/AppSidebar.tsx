
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Home, TrendingUp, CreditCard, Target, BarChart3, BookOpen, Sparkles, MessageCircle, Settings } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { LogoPlenne } from "./LogoPlenne";
import { Badge } from "../ui/badge";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "transactions", label: "Transações", icon: CreditCard },
  { id: "goals", label: "Metas", icon: Target },
  { id: "investments", label: "Investimentos", icon: TrendingUp },
  { id: "analytics", label: "Análises", icon: BarChart3 },
];

const toolsItems = [
  { id: "education", label: "Educação", icon: BookOpen, new: true },
  { id: "whatsapp", label: "WhatsApp IA", icon: MessageCircle },
]

const settingsItems = [
    { id: "subscription", label: "Assinatura", icon: Sparkles },
    { id: "settings", label: "Configurações", icon: Settings },
]

export function AppSidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const { profile, subscription } = useProfile();
  
  const renderMenuItems = (items: typeof navItems) => {
    return items.map(item => (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          isActive={activeTab === item.id}
          onClick={() => setActiveTab(item.id)}
          className="justify-start"
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
          {'new' in item && item.new && <Badge variant="secondary" className="ml-auto">Novo</Badge>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  }

  return (
    <Sidebar className="border-r border-border/80 bg-surface/50">
      <SidebarHeader className="p-4 border-b border-border/80">
        <LogoPlenne />
      </SidebarHeader>
      <SidebarContent className="p-4">
        <div className="space-y-6">
          <SidebarGroup>
            <SidebarGroupLabel>Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(navItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Ferramentas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(toolsItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto border-t border-border/80">
         <SidebarMenu>
            {renderMenuItems(settingsItems)}
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
