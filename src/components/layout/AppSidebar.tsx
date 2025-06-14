
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
  const { profile } = useProfile();

  const renderMenuItems = (items: typeof navItems) => {
    return items.map(item => (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          isActive={activeTab === item.id}
          onClick={() => setActiveTab(item.id)}
          className="justify-start font-display text-base rounded-lg transition-all px-2 py-2 gap-3 hover:bg-primary/15 focus-visible:bg-primary/20"
        >
          <item.icon className={`w-6 h-6 ${activeTab === item.id ? "text-primary" : "text-secondary"}`} />
          <span>{item.label}</span>
          {'new' in item && item.new && <Badge variant="secondary" className="ml-auto">Novo</Badge>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  }

  return (
    <Sidebar className="border-r border-primary/20 bg-surface/95 shadow-card min-h-screen">
      <SidebarHeader className="p-6 border-b border-gray-200 bg-neutral-light flex items-center justify-center">
        <LogoPlenne />
      </SidebarHeader>
      <SidebarContent className="p-5 pt-8">
        <div className="space-y-7">
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase font-bold text-xs text-primary tracking-wider">Navegação</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(navItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="uppercase font-bold text-xs text-secondary tracking-wider">Ferramentas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(toolsItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-5 mt-auto border-t border-primary/20 bg-neutral-light">
         <SidebarMenu>
            {renderMenuItems(settingsItems)}
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
