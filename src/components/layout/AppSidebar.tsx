import {
  Home,
  User,
  Users,
  PiggyBank,
  BarChart3,
  GraduationCap,
  MessageCircle,
  CreditCard,
  Settings,
  LogOut,
  Building2,
  Bell,
  Clock
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { LogoPlenne } from "./LogoPlenne";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { usePlenneSlogan } from "@/hooks/usePlenneSlogan";
import { Badge } from "@/components/ui/badge";

const items = [
  {
    title: "Dashboard",
    url: "/app",
    icon: Home,
  },
  {
    title: "Transações Pendentes",
    url: "/app/incoming",
    icon: Clock,
  },
  {
    title: "Perfil",
    url: "/app/profile",
    icon: User,
  },
  {
    title: "Workspaces",
    url: "/app/workspaces",
    icon: Building2,
  },
  {
    title: "Orçamentos",
    url: "/app/budgets",
    icon: PiggyBank,
  },
  {
    title: "Análises",
    url: "/app/analytics",
    icon: BarChart3,
  },
  {
    title: "Alertas Financeiros",
    url: "/app/alerts",
    icon: Bell,
  },
  {
    title: "Educação",
    url: "/app/education",
    icon: GraduationCap,
  },
  {
    title: "Assistente",
    url: "/app/assistant",
    icon: MessageCircle,
  },
  {
    title: "Assinatura",
    url: "/app/subscription",
    icon: CreditCard,
  },
  {
    title: "Configurações",
    url: "/app/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { getRandomSlogan } = usePlenneSlogan();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Sidebar variant="inset" className="bg-gradient-to-b from-white to-[#f8fffe]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="hover:bg-[#eaf6ee] data-[state=active]:bg-[#eaf6ee] data-[state=active]:text-[#003f5c]"
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-4">
        {/* Logo com slogan aleatório */}
        <div className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-r from-[#003f5c] to-[#2f9e44] rounded-lg">
          <LogoPlenne />
          <p className="text-xs text-white text-center font-medium">
            {getRandomSlogan()}
          </p>
        </div>
        
        {/* Informações do usuário */}
        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
            <AvatarFallback className="bg-[#eaf6ee] text-[#003f5c] font-bold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#003f5c] truncate">
              {profile?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleSignOut}
              className="hover:bg-[#d62828]/10 hover:text-[#d62828] justify-center"
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}