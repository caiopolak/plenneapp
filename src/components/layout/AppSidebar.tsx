import React from "react";
import {
  LayoutDashboard,
  Settings,
  Wallet,
  Activity,
  GraduationCap,
  MessageSquare,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { LogoPlenne } from "./LogoPlenne";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  const { signOut } = useAuth();

  return (
    <aside className="hidden sm:flex flex-col w-[280px] bg-surface border-r border-primary/10 h-screen py-4 px-3 fixed top-0 left-0 z-20">
      <div className="flex items-center gap-2 px-3 mb-6">
        <LogoPlenne />
        <span className="slogan text-xs font-medium text-primary/80">Controle financeiro de verdade.</span>
      </div>
      <Separator className="mb-4" />
      <nav className="flex flex-col flex-1">
        <button
          className={`sidebar-link ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <LayoutDashboard className="w-5 h-5 mr-2" />
          Dashboard
        </button>
        <button
          className={`sidebar-link ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <Activity className="w-5 h-5 mr-2" />
          Análises
        </button>
        <button
          className={`sidebar-link ${activeTab === "education" ? "active" : ""}`}
          onClick={() => setActiveTab("education")}
        >
          <GraduationCap className="w-5 h-5 mr-2" />
          Educação
        </button>
        <button
          className={`sidebar-link ${activeTab === "whatsapp" ? "active" : ""}`}
          onClick={() => setActiveTab("whatsapp")}
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          WhatsApp
        </button>
        <button
          className={`sidebar-link ${activeTab === "subscription" ? "active" : ""}`}
          onClick={() => setActiveTab("subscription")}
        >
          <Settings className="w-5 h-5 mr-2" />
          Assinatura
        </button>
        <button
          className={`sidebar-link ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <UserIcon className="w-5 h-5 mr-2" />
          Perfil
        </button>
        <Button
          variant="ghost"
          size="default"
          onClick={signOut}
          className="sidebar-link mt-auto text-left"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair
        </Button>
      </nav>
    </aside>
  );
}
