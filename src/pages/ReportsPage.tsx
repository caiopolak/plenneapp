import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ConsolidatedFinancialReport } from "@/components/dashboard/ConsolidatedFinancialReport";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const isMobile = useIsMobile();

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
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-display brand-gradient-text">
                Relatórios
              </h1>
              <p className="text-muted-foreground">
                Visão consolidada das suas finanças
              </p>
            </div>
          </div>
          
          <ConsolidatedFinancialReport />
        </main>
      </div>
    </SidebarProvider>
  );
}