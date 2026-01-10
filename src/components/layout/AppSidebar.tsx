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
  TrendingUp,
  FileText
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
    title: "Visão Geral",
    url: "/app",
    icon: Home,
    description: "Seu painel financeiro completo",
    badge: null
  },
  {
    title: "Transações",
    url: "/app/transactions",
    icon: BarChart3,
    description: "Receitas e despesas",
    badge: null
  },
  {
    title: "Metas",
    url: "/app/goals",
    icon: Target,
    description: "Seus objetivos financeiros",
    badge: null
  },
  {
    title: "Investimentos", 
    url: "/app/investments",
    icon: TrendingUp,
    description: "Sua carteira de ativos",
    badge: null
  },
  {
    title: "Orçamentos",
    url: "/app/budgets",
    icon: PiggyBank,
    description: "Controle por categoria",
    badge: null
  },
  {
    title: "Análises",
    url: "/app/analytics",
    icon: BarChart3,
    description: "Gráficos e insights",
    badge: null
  },
  {
    title: "Relatórios",
    url: "/app/reports",
    icon: FileText,
    description: "Visão consolidada",
    badge: "Novo"
  },
];

const educationItems = [
  {
    title: "Aprender",
    url: "/app/education",
    icon: GraduationCap,
    description: "Educação financeira",
    badge: "Novo"
  },
  {
    title: "Assistente IA",
    url: "/app/assistant",
    icon: MessageCircle,
    description: "Tire suas dúvidas",
    badge: "Novo"
  },
  {
    title: "Alertas",
    url: "/app/alerts",
    icon: Bell,
    description: "Notificações inteligentes",
    badge: "Novo"
  },
];

const configItems = [
  {
    title: "Meu Perfil",
    url: "/app/profile",
    icon: User,
    description: "Seus dados pessoais",
    badge: null
  },
  {
    title: "Workspaces",
    url: "/app/workspaces",
    icon: Building2,
    description: "Ambientes separados",
    badge: null
  },
  {
    title: "Planos",
    url: "/app/subscription",
    icon: CreditCard,
    description: "Sua assinatura",
    badge: null
  },
  {
    title: "Configurações",
    url: "/app/settings",
    icon: Settings,
    description: "Preferências do app",
    badge: null
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

  // Check if current path matches item url (exact match for /app, startsWith for others)
  const isActivePath = (itemUrl: string) => {
    if (itemUrl === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(itemUrl);
  };

  return (
    <Sidebar variant="inset" className="bg-background border-r">
      <SidebarContent className="space-y-2 bg-background overflow-y-auto">
        {/* Menu Principal - Financeiro */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold text-sm md:text-xs px-3 py-2">💰 Finanças</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item) => {
                const isActive = isActivePath(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className={`
                        min-h-[44px] md:min-h-[36px] px-3 transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-r from-primary/20 to-secondary/10 border border-primary/30 rounded-xl shadow-sm text-primary font-medium' 
                          : 'hover:bg-secondary/10'
                        }
                      `}
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        <div className={isActive ? "p-1.5 rounded-lg bg-primary/20" : ""}>
                          <item.icon className={`h-5 w-5 md:h-4 md:w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                        </div>
                        <span className="text-base md:text-sm">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-secondary/20 text-secondary border-secondary/30">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Educação */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-secondary font-semibold text-sm md:text-xs px-3 py-2">📚 Aprendizado</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {educationItems.map((item) => {
                const isActive = isActivePath(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className={`
                        min-h-[44px] md:min-h-[36px] px-3 transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-r from-secondary/20 to-primary/10 border border-secondary/30 rounded-xl shadow-sm text-secondary font-medium' 
                          : 'hover:bg-secondary/10'
                        }
                      `}
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        <div className={isActive ? "p-1.5 rounded-lg bg-secondary/20" : ""}>
                          <item.icon className={`h-5 w-5 md:h-4 md:w-4 shrink-0 ${isActive ? 'text-secondary' : ''}`} />
                        </div>
                        <span className="text-base md:text-sm">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-secondary/20 text-secondary border-secondary/30">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Configurações */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold text-sm md:text-xs px-3 py-2">⚙️ Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {configItems.map((item) => {
                const isActive = isActivePath(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className={`
                        min-h-[44px] md:min-h-[36px] px-3 transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-r from-muted/40 to-muted/20 border border-border rounded-xl shadow-sm text-foreground font-medium' 
                          : 'hover:bg-secondary/10'
                        }
                      `}
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        <div className={isActive ? "p-1.5 rounded-lg bg-muted" : ""}>
                          <item.icon className={`h-5 w-5 md:h-4 md:w-4 shrink-0 ${isActive ? 'text-foreground' : ''}`} />
                        </div>
                        <span className="text-base md:text-sm">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-secondary/20 text-secondary border-secondary/30">
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 space-y-3 bg-background">
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
              className="hover:bg-destructive/10 hover:text-destructive justify-center min-h-[44px] md:min-h-[36px]"
            >
              <LogOut className="h-5 w-5 md:h-4 md:w-4" />
              <span className="text-base md:text-sm">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}