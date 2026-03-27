import { useEffect } from "react";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { GlassCard } from "@/components/GlassCard";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { RiskAlerts } from "@/components/dashboard/RiskAlerts";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity } from "lucide-react";

export default function Dashboard() {
  const { totalValue, totalCost, pnl, returnPct, assets, simulatePriceUpdate } = usePortfolioStore();

  useEffect(() => {
    const interval = setInterval(simulatePriceUpdate, 5000);
    return () => clearInterval(interval);
  }, [simulatePriceUpdate]);

  const pnlValue = pnl();
  const retValue = returnPct();
  const isPositive = pnlValue >= 0;

  const stats = [
    {
      label: "Portfolio Value",
      value: `KES ${totalValue().toLocaleString("en-KE")}`,
      icon: DollarSign,
      glow: "cyan" as const,
    },
    {
      label: "Total Cost",
      value: `KES ${totalCost().toLocaleString("en-KE")}`,
      icon: BarChart3,
      glow: "none" as const,
    },
    {
      label: "P&L",
      value: `${isPositive ? "+" : ""}KES ${pnlValue.toLocaleString("en-KE")}`,
      icon: isPositive ? TrendingUp : TrendingDown,
      glow: isPositive ? ("cyan" as const) : ("red" as const),
    },
    {
      label: "Return %",
      value: `${isPositive ? "+" : ""}${retValue.toFixed(2)}%`,
      icon: Activity,
      glow: isPositive ? ("cyan" as const) : ("red" as const),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Real-time NSE portfolio overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <GlassCard key={s.label} glow={s.glow}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className="text-lg font-bold mt-1 font-mono text-foreground">{s.value}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PortfolioChart />
        </div>
        <div>
          <RiskAlerts />
        </div>
      </div>

      <GlassCard hover={false}>
        <h3 className="text-sm font-semibold text-foreground mb-3">Holdings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                <th className="text-left pb-2">Symbol</th>
                <th className="text-right pb-2">Shares</th>
                <th className="text-right pb-2">Avg Price</th>
                <th className="text-right pb-2">Current</th>
                <th className="text-right pb-2">Value</th>
                <th className="text-right pb-2">P&L %</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => {
                const val = a.shares * a.current_price;
                const plPct = ((a.current_price - a.avg_price) / a.avg_price) * 100;
                return (
                  <tr key={a.symbol} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-semibold text-foreground">{a.symbol}</td>
                    <td className="py-2.5 text-right font-mono text-muted-foreground">{a.shares.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-mono text-muted-foreground">{a.avg_price.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-mono text-foreground">{a.current_price.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-mono text-foreground">{val.toLocaleString("en-KE")}</td>
                    <td className={`py-2.5 text-right font-mono font-semibold ${plPct >= 0 ? "text-success" : "text-destructive"}`}>
                      {plPct >= 0 ? "+" : ""}{plPct.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
