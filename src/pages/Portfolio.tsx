import { usePortfolioStore } from "@/store/usePortfolioStore";
import { GlassCard } from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { mapUserStocksToAssets } from "@/lib/userStocks";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useEffect, useMemo, useState } from "react";

const COLORS = ["hsl(187, 92%, 69%)", "hsl(231, 48%, 48%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)"];

export default function Portfolio() {
  const { user } = useAuth();
  const { assets, totalValue, totalCost, pnl, simulatePriceUpdate, setAssets } = usePortfolioStore();
  const [drafts, setDrafts] = useState<Record<string, { shares: string; avgPrice: string }>>({});
  const [newTicker, setNewTicker] = useState("");
  const [newShares, setNewShares] = useState("0");
  const [newAvgPrice, setNewAvgPrice] = useState("0");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(simulatePriceUpdate, 5000);
    return () => clearInterval(interval);
  }, [simulatePriceUpdate]);

  useEffect(() => {
    const nextDrafts = assets.reduce<Record<string, { shares: string; avgPrice: string }>>((acc, asset) => {
      acc[asset.symbol] = {
        shares: String(asset.shares),
        avgPrice: String(asset.avg_price),
      };
      return acc;
    }, {});
    setDrafts(nextDrafts);
  }, [assets]);

  const isDirty = useMemo(
    () =>
      assets.some((asset) => {
        const draft = drafts[asset.symbol];
        if (!draft) return false;
        return Number(draft.shares) !== asset.shares || Number(draft.avgPrice) !== asset.avg_price;
      }),
    [assets, drafts],
  );

  const updateDraft = (symbol: string, patch: Partial<{ shares: string; avgPrice: string }>) => {
    setDrafts((current) => ({
      ...current,
      [symbol]: {
        ...current[symbol],
        ...patch,
      },
    }));
  };

  const adjustDraftShares = (symbol: string, delta: number) => {
    const currentShares = Number(drafts[symbol]?.shares ?? 0);
    const nextShares = Math.max(0, currentShares + delta);
    updateDraft(symbol, { shares: String(nextShares) });
  };

  const refreshAssetsFromDb = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("user_stocks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    setAssets(mapUserStocksToAssets(data ?? []));
  };

  const handleSaveChanges = async () => {
    if (!user?.id || saving || !isDirty) return;
    setSaving(true);
    setSaveMessage(null);

    const updates = assets.map((asset) => {
      const draft = drafts[asset.symbol];
      const shares = Math.max(0, Number(draft?.shares ?? asset.shares));
      const avgPrice = Math.max(0, Number(draft?.avgPrice ?? asset.avg_price));

      return supabase
        .from("user_stocks")
        .update({
          number_of_shares: shares,
          average_buy_price: avgPrice,
        })
        .eq("user_id", user.id)
        .eq("ticker_symbol", asset.symbol);
    });

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      setSaveMessage(`Save failed: ${failed.error.message}`);
      setSaving(false);
      return;
    }

    try {
      await refreshAssetsFromDb();
      setSaveMessage("Changes saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSaveMessage(`Save failed: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveHolding = async (symbol: string) => {
    if (!user?.id || saving) return;
    setSaving(true);
    setSaveMessage(null);

    const { error } = await supabase
      .from("user_stocks")
      .delete()
      .eq("user_id", user.id)
      .eq("ticker_symbol", symbol);

    if (error) {
      setSaveMessage(`Remove failed: ${error.message}`);
      setSaving(false);
      return;
    }

    try {
      await refreshAssetsFromDb();
      setSaveMessage(`${symbol} removed.`);
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : "Unknown error";
      setSaveMessage(`Removed, but refresh failed: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddHolding = async () => {
    if (!user?.id || saving) return;

    const ticker = newTicker.trim().toUpperCase();
    const shares = Math.max(0, Number(newShares || 0));
    const avgPrice = Math.max(0, Number(newAvgPrice || 0));

    if (!ticker) {
      setSaveMessage("Please enter a ticker symbol.");
      return;
    }

    if (assets.some((asset) => asset.symbol === ticker)) {
      setSaveMessage(`${ticker} already exists in your portfolio.`);
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    const { error } = await supabase.from("user_stocks").insert({
      user_id: user.id,
      ticker_symbol: ticker,
      number_of_shares: shares,
      average_buy_price: avgPrice,
    });

    if (error) {
      setSaveMessage(`Add failed: ${error.message}`);
      setSaving(false);
      return;
    }

    try {
      await refreshAssetsFromDb();
      setNewTicker("");
      setNewShares("0");
      setNewAvgPrice("0");
      setSaveMessage(`${ticker} added.`);
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : "Unknown error";
      setSaveMessage(`Added, but refresh failed: ${message}`);
    } finally {
      setSaving(false);
    }
  };

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

      <GlassCard hover={false}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-foreground">Manage Holdings</h3>
          <Button onClick={handleSaveChanges} disabled={saving || !isDirty}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>

        <div className="hidden md:grid md:grid-cols-4 gap-3 text-xs text-muted-foreground pb-1 border-b border-border/50">
          <span>Ticker</span>
          <span>Shares you own</span>
          <span>Avg buy (KES / share)</span>
          <span className="text-right">Remove</span>
        </div>

        <div className="space-y-4">
          {assets.map((asset) => (
            <div key={asset.symbol} className="grid grid-cols-1 md:grid-cols-4 gap-3 md:items-end">
              <div className="space-y-1.5">
                <Label className="md:hidden">Ticker</Label>
                <Input value={asset.symbol} disabled aria-label="Ticker" />
              </div>
              <div className="md:col-span-1 space-y-1.5">
                <Label className="md:hidden">Shares you own</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => adjustDraftShares(asset.symbol, -100)}
                    disabled={saving}
                    aria-label="Subtract 100 shares"
                  >
                    -100
                  </Button>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={drafts[asset.symbol]?.shares ?? "0"}
                    onChange={(event) => updateDraft(asset.symbol, { shares: event.target.value })}
                    placeholder="0"
                    aria-label={`${asset.symbol} number of shares`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => adjustDraftShares(asset.symbol, 100)}
                    disabled={saving}
                    aria-label="Add 100 shares"
                  >
                    +100
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="md:hidden">Avg buy (KES / share)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={drafts[asset.symbol]?.avgPrice ?? "0"}
                  onChange={(event) => updateDraft(asset.symbol, { avgPrice: event.target.value })}
                  placeholder="0.00"
                  aria-label={`${asset.symbol} average buy price per share in KES`}
                />
              </div>
              <div className="space-y-1.5 md:flex md:items-end md:justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full md:w-auto"
                  onClick={() => handleRemoveHolding(asset.symbol)}
                  disabled={saving}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">Add new holding</p>
            <p className="text-xs text-muted-foreground mt-1">
              Enter the NSE ticker, how many whole shares you hold, and your weighted average purchase price per share (KES).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="portfolio-new-ticker">Ticker</Label>
              <p className="text-xs text-muted-foreground">Stock symbol (e.g. BAT, ABSA)</p>
              <Input
                id="portfolio-new-ticker"
                value={newTicker}
                onChange={(event) => setNewTicker(event.target.value)}
                placeholder="BAT"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="portfolio-new-shares">Number of shares</Label>
              <p className="text-xs text-muted-foreground">Whole units you own</p>
              <Input
                id="portfolio-new-shares"
                type="number"
                min={0}
                step={1}
                value={newShares}
                onChange={(event) => setNewShares(event.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="portfolio-new-avg">Average buy price</Label>
              <p className="text-xs text-muted-foreground">KES per share (not total cost)</p>
              <Input
                id="portfolio-new-avg"
                type="number"
                min={0}
                step={0.01}
                value={newAvgPrice}
                onChange={(event) => setNewAvgPrice(event.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5 md:flex md:flex-col md:justify-end">
              <Button type="button" className="w-full" onClick={handleAddHolding} disabled={saving}>
                Add holding
              </Button>
            </div>
          </div>
        </div>

        {saveMessage && (
          <p className={`text-sm mt-3 ${saveMessage.includes("failed") ? "text-destructive" : "text-success"}`}>
            {saveMessage}
          </p>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {assets.map((a) => {
            const value = a.shares * a.current_price;
            const cost = a.shares * a.avg_price;
            const pl = value - cost;
            const plPct = a.avg_price > 0 ? ((a.current_price - a.avg_price) / a.avg_price) * 100 : 0;
            const totalPortfolioValue = totalValue();
            const weight = totalPortfolioValue > 0 ? ((value / totalPortfolioValue) * 100).toFixed(1) : "0.0";

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
