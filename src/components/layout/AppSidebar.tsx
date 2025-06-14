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

  // Responsivo: Drawer no mobile/tablet, sidebar fixa no desktop
  // Determina se está em mobile com "window.innerWidth" (versão simples)
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 1024);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  const renderMenuItems = (items: typeof navItems) => {
    return items.map(item => (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          isActive={activeTab === item.id}
          onClick={() => setActiveTab(item.id)}
          className={`justify-start font-display text-base rounded-lg transition-all px-2 py-2 gap-3 hover:bg-primary/15 focus-visible:bg-primary/20 ${
            activeTab === item.id ? "bg-primary/20 text-primary border-l-4 border-primary font-bold" : ""
          }`}
        >
          <item.icon className={`w-6 h-6 ${activeTab === item.id ? "text-primary" : "text-secondary"}`} />
          <span>{item.label}</span>
          {'new' in item && item.new && <Badge variant="secondary" className="ml-auto">Novo</Badge>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  }

  // mobile: abre como drawer, desktop: sidebar fixa
  return isMobile ? (
    <Sidebar className="fixed inset-y-0 left-0 z-50 w-60 bg-surface/95 border-r border-primary/20 shadow-card">
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
  ) : (
    <Sidebar className="border-r border-primary/20 bg-surface/95 shadow-card min-h-screen w-60 flex flex-col">
      <SidebarHeader className="p-6 border-b border-gray-200 bg-neutral-light flex items-center justify-center">
        <LogoPlenne />
      </SidebarHeader>
      <SidebarContent className="p-5 pt-8 flex-1 flex flex-col justify-between">
        <div>
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
        <SidebarFooter className="p-0">
          <SidebarMenu>
            {renderMenuItems(settingsItems)}
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
