import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ConsolidatedFinancialReport } from "@/components/dashboard/ConsolidatedFinancialReport";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { FeatureGate } from "@/components/subscription/FeatureGate";
import { Badge } from "@/components/ui/badge";
import { Crown, FileText } from "lucide-react";

export default function ReportsPage() {
  const isMobile = useIsMobile();
  const { currentPlan, isPremium } = usePlanAccess();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className={cn(
          "flex-1 overflow-auto",
          isMobile ? "p-4" : "p-6 lg:p-8"
        )}>
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
                  Relatórios
                </h1>
                {!isPremium && (
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    <Crown className="w-3 h-3 mr-1" />
                    PRO
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Visão consolidada das suas finanças com exportação em PDF
              </p>
            </div>
          </div>
          
          <FeatureGate 
            feature="advancedReports"
            showBlurred={true}
            customTitle="Relatórios Financeiros em PDF"
            customDescription="Exporte relatórios completos com gráficos, tabelas detalhadas e métricas de saúde financeira. Disponível nos planos Pro e Business."
          >
            <ConsolidatedFinancialReport />
          </FeatureGate>
        </main>
      </div>
    </SidebarProvider>
  );
}