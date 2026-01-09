import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import FinancieApp from "@/pages/FinancieApp";
import LandingPage from "@/pages/LandingPage";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/app/*" 
        element={
          <ProtectedRoute>
            <FinancieApp />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
