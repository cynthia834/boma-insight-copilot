import type { Asset, AnalysisResult } from "@/types/portfolio";

export function analyzePortfolio(assets: Asset[]): AnalysisResult {
  const totalValue = assets.reduce((s, a) => s + a.shares * a.current_price, 0);
  const sectorMap: Record<string, number> = {};

  assets.forEach((a) => {
    const val = a.shares * a.current_price;
    sectorMap[a.sector] = (sectorMap[a.sector] || 0) + val;
  });

  const sectorConcentration: Record<string, number> = {};
  Object.entries(sectorMap).forEach(([sector, val]) => {
    sectorConcentration[sector] = totalValue > 0 ? Math.round((val / totalValue) * 100) : 0;
  });

  const bankingPct = sectorConcentration["Banking"] || 0;
  const losers = assets.filter(
    (a) => a.avg_price > 0 && ((a.current_price - a.avg_price) / a.avg_price) * 100 < -2
  );

  let riskLevel = "Low";
  if (bankingPct > 60) riskLevel = "High";
  else if (bankingPct > 40) riskLevel = "Moderate";

  const riskSummary = `Portfolio risk is ${riskLevel}. ${
    bankingPct > 50
      ? `Banking sector accounts for ${bankingPct}% of holdings — consider diversifying.`
      : "Sector allocation is reasonably balanced."
  }${
    losers.length > 0
      ? ` ${losers.map((l) => l.symbol).join(", ")} ${losers.length === 1 ? "is" : "are"} currently underperforming.`
      : ""
  }`;

  const recommendation =
    bankingPct > 50
      ? "🔄 Rebalance: Consider reducing banking exposure by 15-20% and allocating to Manufacturing or Agricultural sectors for better diversification. Monitor SCOM and COOP for potential entry points after price stabilization."
      : losers.length > 0
      ? `⚠️ Watch: ${losers.map((l) => l.symbol).join(", ")} showing weakness. Consider setting stop-loss orders at 5% below current levels. Overall portfolio structure is sound.`
      : "✅ Portfolio is well-positioned. Consider adding exposure to energy or agricultural sectors for further diversification. Current momentum favors holding existing positions.";

  return { riskSummary, sectorConcentration, recommendation };
}
