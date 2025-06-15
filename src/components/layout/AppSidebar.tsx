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
  Users,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LogoPlenne } from "./LogoPlenne";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";

// Slogans para sortear ao recarregar a página
const SLOGANS = [
  "Controle financeiro de verdade.",
  "Sua vida financeira, plena.",
  "Transforme seus sonhos em conquistas.",
  "Planeje, realize, viva melhor.",
  "Disciplina hoje, plenitude amanhã.",
  "Acompanhe. Evolua. Conquiste.",
];

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  const { signOut } = useAuth();
  const { profile, subscription } = useProfile();

  // Sorteia slogan uma vez por recarga
  const [slogan] = React.useState(() => {
    return SLOGANS[Math.floor(Math.random() * SLOGANS.length)];
  });

  // Cores para diferentes planos
  function getPlanColor(plan: string) {
    if (plan === "business") return "bg-green-100 text-green-700";
    if (plan === "pro") return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  }

  // Menu items config (adicionando Workspaces)
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
      key: "workspaces",
      icon: Users,
      label: "Workspaces",
    },
    {
      key: "profile",
      icon: UserIcon,
      label: "Perfil",
    },
  ];

  return (
    <>
      {/* SidebarTrigger: botão hambúrguer discreto no topo direito em mobile/tablet */}
      <div className="fixed top-4 right-4 z-40 md:hidden">
        <SidebarTrigger
          className="rounded-full bg-white/90 shadow-lg border border-gray-200 
          hover:bg-blue-100 focus:bg-blue-200 transition-colors w-10 h-10 
          flex items-center justify-center text-primary"
          aria-label="Abrir menu"
        />
      </div>
      {/* Sidebar (Drawer no mobile) */}
      <Sidebar>
        <SidebarContent className="w-full max-w-xs min-w-[200px] bg-white shadow-lg flex flex-col h-full p-0">
          <SidebarGroup className="p-0">
            {/* Avatar e info responsivos */}
            <div
              className="flex flex-col items-center gap-0 py-5 px-2 bg-gradient-to-r from-blue-50 to-white w-full
              sm:py-7 sm:pt-8"
            >
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-primary/60 shadow-lg mb-2 sm:mb-3">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name || "Avatar"} />
                ) : (
                  <AvatarFallback>
                    {profile?.full_name
                      ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                      : <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col items-center w-full gap-0.5">
                <span className="font-display font-bold text-primary text-lg sm:text-xl truncate max-w-[140px] sm:max-w-[170px] block">{profile?.full_name || "Usuário"}</span>
                <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[160px] sm:max-w-[200px]">{profile?.email}</span>
                {profile?.phone && (
                  <span className="text-xs text-muted-foreground">{profile.phone}</span>
                )}
                {subscription?.plan && (
                  <span
                    className={`mt-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${getPlanColor(subscription.plan)}`}
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
            {/* Logo e slogan responsivos */}
            <div className="flex flex-col items-center gap-0 px-1 sm:px-3 py-3 sm:py-4 border-b border-primary/10 w-full">
              <LogoPlenne className="mb-1 scale-90 sm:scale-100" />
              <span className="text-xs italic text-primary/80 text-center px-1 sm:px-2 transition-all animate-fade-in font-medium max-w-[170px] sm:max-w-[196px]">
                {slogan}
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
            // Neutro: cor clara com borda normal para todos os dispositivos
            className="w-full flex items-center justify-start px-2 min-h-[48px] 
              bg-[#f4f4f4] text-graphite border border-gray-300 rounded-none
              hover:bg-gray-200 hover:text-graphite
              focus:bg-gray-200
              md:bg-transparent md:text-primary md:border-none md:rounded-xl md:hover:bg-blue-50 md:focus:bg-blue-100
              transition"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair
          </Button>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
