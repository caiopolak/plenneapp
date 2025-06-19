
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Routes, Route } from "react-router-dom";
import { EnhancedDashboard } from "@/components/dashboard/EnhancedDashboard";
import ProfilePage from "./ProfilePage";
import BudgetPage from "./BudgetPage";
import Education from "./Education";
import AssistantPage from "./AssistantPage";
import SettingsPage from "./SettingsPage";
import IncomingPage from "./IncomingPage";
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
        <main className="p-4 md:p-6">
          <Routes>
            <Route path="/" element={<EnhancedDashboard />} />
            <Route path="/app" element={<EnhancedDashboard />} />
            <Route path="/app/profile" element={<ProfilePage />} />
            <Route path="/app/workspaces" element={<WorkspaceManager />} />
            <Route path="/app/budgets" element={<BudgetPage />} />
            <Route path="/app/analytics" element={<DashboardTabs />} />
            <Route path="/app/education" element={<Education />} />
            <Route path="/app/assistant" element={<AssistantPage />} />
            <Route path="/app/subscription" element={<SubscriptionPlans />} />
            <Route path="/app/settings" element={<SettingsPage />} />
            <Route path="/app/incoming" element={<IncomingPage />} />
            
            {/* Sub-rotas existentes */}
            <Route path="/app/transactions" element={<TransactionList />} />
            <Route path="/app/goals" element={<GoalList />} />
            <Route path="/app/investments" element={<InvestmentList />} />
            
            {/* Rotas sem /app para compatibilidade */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/workspaces" element={<WorkspaceManager />} />
            <Route path="/budgets" element={<BudgetPage />} />
            <Route path="/analytics" element={<DashboardTabs />} />
            <Route path="/education" element={<Education />} />
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
