
import { EnhancedDashboard } from "@/components/dashboard/EnhancedDashboard";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#f8fffe] to-[#eaf6ee]">
        <div className="container mx-auto p-4 space-y-6">
          <EnhancedDashboard />
          <DashboardTabs />
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
};

export default Index;
