
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
import { Home, TrendingUp, CreditCard, Target, BarChart3, BookOpen, Sparkles, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LogoPlenne } from "./LogoPlenne";
import { useProfile } from "@/hooks/useProfile";
import { useLocation } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "transactions", label: "Transações", icon: CreditCard },
  { id: "goals", label: "Metas", icon: Target },
  { id: "investments", label: "Investimentos", icon: TrendingUp },
  { id: "analytics", label: "Análises", icon: BarChart3 },
  { id: "education", label: "Educação", icon: BookOpen },
  { id: "whatsapp", label: "WhatsApp IA", icon: MessageCircle },
];

const chartData = [
  { name: "Essenciais", value: 62, color: "#017F66" },
  { name: "Lazer", value: 22, color: "#0057FF" },
  { name: "Outros", value: 16, color: "#F5B942" },
];

export function AppSidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const { profile } = useProfile();
  return (
    <Sidebar>
      <SidebarHeader className="flex justify-center items-center p-6 pb-2">
        <LogoPlenne showSymbol className="scale-110" />
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col items-center mt-2 mb-4">
          <div className="w-full h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={48}
                  paddingAngle={3}
                  stroke="none"
                  label={false}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <span className="text-xs text-muted-foreground mt-0">Distribuição de Gastos</span>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="pl-5 pt-2 text-xs text-muted-foreground/80 font-semibold">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    variant="default"
                    className="pl-5"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    {item.id === "education" && <Sparkles className="ml-1 w-3 h-3 text-[--gold]" />}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="flex flex-col items-center py-4 gap-2 border-t">
        <span className="text-xs text-gray-400 font-inter">
          Bem-vindo, {profile?.full_name?.split(" ")[0] || "usuário"}!
        </span>
      </SidebarFooter>
    </Sidebar>
  );
}
