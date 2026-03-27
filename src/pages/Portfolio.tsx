import { usePortfolioStore } from "@/store/usePortfolioStore";
import { GlassCard } from "@/components/GlassCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useEffect } from "react";

const COLORS = ["hsl(187, 92%, 69%)", "hsl(231, 48%, 48%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)"];

export default function Portfolio() {
  const { assets, totalValue, totalCost, pnl, simulatePriceUpdate } = usePortfolioStore();

  useEffect(() => {
    const interval = setInterval(simulatePriceUpdate, 5000);
    return () => clearInterval(interval);
  }, [simulatePriceUpdate]);

  const sectorData = assets.reduce<Record<string, number>>((acc, a) => {
    const val = a.shares * a.current_price;
    acc[a.sector] = (acc[a.sector] || 0) + val;
    return acc;
  }, {});

  const pieData = Object.entries(sectorData).map(([name, value]) => ({ name, value: Math.round(value) }));

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-foreground">Portfolio</h2>
        <p className="text-sm text-muted-foreground">Detailed holdings and sector allocation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {assets.map((a) => {
            const value = a.shares * a.current_price;
            const cost = a.shares * a.avg_price;
            const pl = value - cost;
            const plPct = ((a.current_price - a.avg_price) / a.avg_price) * 100;
            const weight = ((value / totalValue()) * 100).toFixed(1);

            return (
              <GlassCard key={a.symbol} glow={plPct < -2 ? "red" : plPct > 5 ? "cyan" : "none"}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">{a.symbol}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{a.sector}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{a.shares.toLocaleString()} shares · {weight}% of portfolio</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-foreground">KES {value.toLocaleString()}</p>
                    <p className={`text-xs font-mono font-semibold ${pl >= 0 ? "text-success" : "text-destructive"}`}>
                      {pl >= 0 ? "+" : ""}KES {pl.toLocaleString()} ({plPct >= 0 ? "+" : ""}{plPct.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        <GlassCard hover={false}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Sector Allocation</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(220, 40%, 8%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 96%)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-3">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-mono text-foreground">KES {d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Value</p>
          <p className="text-lg font-bold font-mono text-foreground mt-1">KES {totalValue().toLocaleString()}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Cost</p>
          <p className="text-lg font-bold font-mono text-foreground mt-1">KES {totalCost().toLocaleString()}</p>
        </GlassCard>
        <GlassCard glow={pnl() >= 0 ? "cyan" : "red"}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Net P&L</p>
          <p className={`text-lg font-bold font-mono mt-1 ${pnl() >= 0 ? "text-success" : "text-destructive"}`}>
            {pnl() >= 0 ? "+" : ""}KES {pnl().toLocaleString()}
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
