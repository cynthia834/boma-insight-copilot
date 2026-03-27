import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { buildUserStockSeedRows } from "@/lib/defaultPortfolioSeed";
import { mapUserStocksToAssets } from "@/lib/userStocks";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Risk from "./pages/Risk";
import Copilot from "./pages/Copilot";
import SettingsPage from "./pages/Settings";
import AuthPage from "./pages/Auth";
import OnboardingPage from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const ONBOARDING_KEY = "needs_portfolio_onboarding";

function ProtectedAppRoutes() {
  const location = useLocation();
  const { session, loading } = useAuth();
  const setAssets = usePortfolioStore((state) => state.setAssets);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);

  useEffect(() => {
    const syncPortfolio = async () => {
      if (!session?.user?.id) {
        setAssets([]);
        setIsLoadingPortfolio(false);
        return;
      }

      setIsLoadingPortfolio(true);

      const { data, error } = await supabase
        .from("user_stocks")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to load user stocks", error);
        setAssets([]);
        setIsLoadingPortfolio(false);
        return;
      }

      let rows = data ?? [];

      if (rows.length === 0) {
        const seedRows = buildUserStockSeedRows(session.user.id);
        const { error: seedError } = await supabase.from("user_stocks").insert(seedRows);
        if (seedError) {
          console.error("Failed to backfill default user stocks", seedError);
        } else {
          const { data: refetched } = await supabase
            .from("user_stocks")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: true });
          rows = refetched ?? [];
        }
      }

      setAssets(mapUserStocksToAssets(rows));
      setIsLoadingPortfolio(false);
    };

    syncPortfolio();
  }, [session?.user?.id, setAssets]);

  if (loading || isLoadingPortfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  const needsOnboarding = sessionStorage.getItem(ONBOARDING_KEY) === "true";
  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  if (!needsOnboarding && location.pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/risk" element={<Risk />} />
        <Route path="/copilot" element={<Copilot />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<ProtectedAppRoutes />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
