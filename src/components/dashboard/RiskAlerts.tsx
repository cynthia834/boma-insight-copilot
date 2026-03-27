import { usePortfolioStore } from "@/store/usePortfolioStore";
import { GlassCard } from "@/components/GlassCard";
import { AlertTriangle } from "lucide-react";

export function RiskAlerts() {
  const assets = usePortfolioStore((s) => s.assets);

  const alerts = assets
    .map((a) => {
      const lossPct = a.avg_price > 0 ? ((a.current_price - a.avg_price) / a.avg_price) * 100 : 0;
      return { symbol: a.symbol, lossPct, sector: a.sector };
    })
    .filter((a) => a.lossPct < -2);

  const messages: Record<string, string> = {
    SCOM: "Safaricom facing headwinds from increased competition in mobile money segment.",
    COOP: "Co-op Bank under pressure from rising NPL ratios in SME lending portfolio.",
    EQTY: "Equity Group monitoring — regional expansion costs impacting short-term margins.",
    KCB: "KCB navigating integration challenges post-acquisition.",
  };

  return (
    <GlassCard hover={false} className="animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <h3 className="text-sm font-semibold text-foreground">Risk Alerts</h3>
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active risk alerts. Portfolio looks healthy.</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.symbol} className="glass-card p-3 glow-red hover:!transform-none">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground text-sm">{a.symbol}</span>
                <span className="text-xs font-mono text-destructive font-semibold">
                  {a.lossPct.toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {messages[a.symbol] || `${a.symbol} is underperforming relative to sector average.`}
              </p>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
