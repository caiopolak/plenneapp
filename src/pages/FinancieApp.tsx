
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Routes, Route } from "react-router-dom";
import { EnhancedDashboard } from "@/components/dashboard/EnhancedDashboard";
import ProfilePageNew from "./ProfilePageNew";
import BudgetPage from "./BudgetPage";
import EducationNew from "./EducationNew";
import AssistantPage from "./AssistantPage";
import SettingsPage from "./SettingsPage";
import IncomingPage from "./IncomingPage";
import AlertsPage from "./AlertsPage";
import { WorkspaceManager } from "@/components/workspaces/WorkspaceManager";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { TransactionList } from "@/components/transactions/TransactionList";
import { GoalList } from "@/components/goals/GoalList";
import { InvestmentList } from "@/components/investments/InvestmentList";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";

export default function FinancieApp() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header móvel */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-primary">Plenne</h1>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Routes>
            <Route path="/" element={<DashboardTabs />} />
            <Route path="/app" element={<DashboardTabs />} />
            <Route path="/app/incoming" element={<IncomingPage />} />
            <Route path="/app/profile" element={<ProfilePageNew />} />
            <Route path="/app/workspaces" element={<WorkspaceManager />} />
            <Route path="/app/budgets" element={<BudgetPage />} />
            <Route path="/app/analytics" element={<EnhancedDashboard />} />
            <Route path="/app/alerts" element={<AlertsPage />} />
            <Route path="/app/education" element={<EducationNew />} />
            <Route path="/app/assistant" element={<AssistantPage />} />
            <Route path="/app/subscription" element={<SubscriptionPlans />} />
            <Route path="/app/settings" element={<SettingsPage />} />
            
            {/* Sub-rotas existentes */}
            <Route path="/app/transactions" element={<TransactionList />} />
            <Route path="/app/goals" element={<GoalList />} />
            <Route path="/app/investments" element={<InvestmentList />} />
            
            {/* Rotas sem /app para compatibilidade */}
            <Route path="/profile" element={<ProfilePageNew />} />
            <Route path="/workspaces" element={<WorkspaceManager />} />
            <Route path="/budgets" element={<BudgetPage />} />
            <Route path="/analytics" element={<EnhancedDashboard />} />
            <Route path="/education" element={<EducationNew />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/subscription" element={<SubscriptionPlans />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/incoming" element={<IncomingPage />} />
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/goals" element={<GoalList />} />
            <Route path="/investments" element={<InvestmentList />} />
          </Routes>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
