import { TickerBar } from "@/components/TickerBar";
import { Activity } from "lucide-react";

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold gradient-text">Boma-Insight AI</h1>
            <p className="text-[10px] text-muted-foreground">NSE Portfolio Copilot</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">NSE Live</span>
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
        </div>
      </div>
      <TickerBar />
    </header>
  );
}
