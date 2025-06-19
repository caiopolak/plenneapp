
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
  Building2
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

const items = [
  {
    title: "Dashboard",
    url: "/app",
    icon: Home,
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
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <LogoPlenne />
      </SidebarHeader>
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
