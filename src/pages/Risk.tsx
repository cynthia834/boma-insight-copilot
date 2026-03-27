import { usePortfolioStore } from "@/store/usePortfolioStore";
import { GlassCard } from "@/components/GlassCard";
import { analyzePortfolio } from "@/lib/mockApi";
import { ShieldAlert, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";
import { useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["hsl(187, 92%, 69%)", "hsl(231, 48%, 48%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)"];

export default function Risk() {
  const { assets, simulatePriceUpdate } = usePortfolioStore();

  useEffect(() => {
    const interval = setInterval(simulatePriceUpdate, 5000);
    return () => clearInterval(interval);
  }, [simulatePriceUpdate]);

  const analysis = useMemo(() => analyzePortfolio(assets), [assets]);

  const sectorChartData = Object.entries(analysis.sectorConcentration).map(([sector, pct]) => ({
    sector,
    percentage: pct,
  }));

  const riskAssets = assets
    .map((a) => ({
      ...a,
      plPct: ((a.current_price - a.avg_price) / a.avg_price) * 100,
    }))
    .sort((a, b) => a.plPct - b.plPct);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-foreground">Risk Analysis</h2>
        <p className="text-sm text-muted-foreground">Portfolio risk assessment and sector concentration</p>
      </div>

      <GlassCard glow="cyan" hover={false}>
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Risk Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.riskSummary}</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Sector Concentration</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorChartData} layout="vertical" margin={{ left: 60 }}>
                <XAxis type="number" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="sector" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220, 40%, 8%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 96%)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Allocation"]}
                />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]} animationDuration={1000}>
                  {sectorChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Asset Risk Ranking</h3>
          <div className="space-y-3">
            {riskAssets.map((a) => (
              <div key={a.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {a.plPct < -2 ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                  <span className="text-sm font-medium text-foreground">{a.symbol}</span>
                  <span className="text-xs text-muted-foreground">{a.sector}</span>
                </div>
                <span className={`text-sm font-mono font-semibold ${a.plPct >= 0 ? "text-success" : "text-destructive"}`}>
                  {a.plPct >= 0 ? "+" : ""}{a.plPct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard glow="cyan" hover={false}>
        <h3 className="text-sm font-semibold text-foreground mb-2">AI Recommendation</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{analysis.recommendation}</p>
      </GlassCard>
    </div>
  );
}
