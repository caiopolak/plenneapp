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
  Clock,
  Target,
  TrendingUp
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

const mainItems = [
  {
    title: "Dashboard",
    url: "/app",
    icon: Home,
    hideOnMobile: true,
  },
  {
    title: "Transações",
    url: "/app/transactions",
    icon: BarChart3,
    hideOnMobile: true,
  },
  {
    title: "Metas",
    url: "/app/goals",
    icon: Target,
    hideOnMobile: true,
  },
  {
    title: "Investimentos", 
    url: "/app/investments",
    icon: TrendingUp,
    hideOnMobile: true,
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
];

const educationItems = [
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
    title: "Alertas Financeiros",
    url: "/app/alerts",
    icon: Bell,
  },
];

const configItems = [
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
    <Sidebar variant="inset" className="bg-background border-r">
      <SidebarContent className="space-y-1 bg-background">
        {/* Menu Principal - Financeiro */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">Financeiro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title} className={item.hideOnMobile ? "hidden md:block" : ""}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="hover:bg-secondary/10 data-[state=active]:bg-secondary/20 data-[state=active]:text-primary"
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

        {/* Menu Educação */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-secondary font-semibold">Educação & Alertas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {educationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="hover:bg-secondary/10 data-[state=active]:bg-secondary/20 data-[state=active]:text-primary"
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

        {/* Menu Configurações */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold">Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="hover:bg-secondary/10 data-[state=active]:bg-secondary/20 data-[state=active]:text-primary"
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
      <SidebarFooter className="p-4 space-y-4 bg-background">
        {/* Logo com slogan aleatório */}
        <div className="flex flex-col items-center space-y-2 p-3 bg-gradient-to-r from-primary to-secondary rounded-lg">
          <LogoPlenne />
          <p className="text-xs text-primary-foreground text-center font-medium">
            {getRandomSlogan()}
          </p>
        </div>
        
        {/* Informações do usuário */}
        <div className="flex items-center space-x-3 p-3 bg-card rounded-lg border">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
            <AvatarFallback className="bg-secondary/20 text-primary font-bold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">
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
              className="hover:bg-destructive/10 hover:text-destructive justify-center"
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