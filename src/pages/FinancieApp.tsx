
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { Routes, Route } from "react-router-dom";
import { EnhancedDashboard } from "@/components/dashboard/EnhancedDashboard";
import ProfilePage from "./ProfilePage";
import BudgetPage from "./BudgetPage";
import Education from "./Education";
import AssistantPage from "./AssistantPage";
import SettingsPage from "./SettingsPage";
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
        <Header />
        <main className="p-4 md:p-6">
          <Routes>
            <Route path="/" element={<EnhancedDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/workspaces" element={<WorkspaceManager />} />
            <Route path="/budgets" element={<BudgetPage />} />
            <Route path="/analytics" element={<DashboardTabs />} />
            <Route path="/education" element={<Education />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/subscription" element={<SubscriptionPlans />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Sub-rotas existentes */}
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/goals" element={<GoalList />} />
            <Route path="/investments" element={<InvestmentList />} />
          </Routes>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
