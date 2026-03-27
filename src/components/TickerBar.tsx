import { usePortfolioStore } from "@/store/usePortfolioStore";
import { TrendingUp, TrendingDown } from "lucide-react";

export function TickerBar() {
  const ticker = usePortfolioStore((s) => s.ticker);

  const items = [...ticker, ...ticker]; // duplicate for seamless loop

  return (
    <div className="overflow-hidden border-b border-border">
      <div className="ticker-scroll flex whitespace-nowrap py-2">
        {items.map((t, i) => (
          <span key={`${t.symbol}-${i}`} className="inline-flex items-center gap-1.5 px-5 text-sm font-mono">
            <span className="font-semibold text-foreground">{t.symbol}</span>
            <span className="text-muted-foreground">KES {t.price.toFixed(2)}</span>
            <span className={`inline-flex items-center gap-0.5 ${t.change >= 0 ? "text-success" : "text-destructive"}`}>
              {t.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {t.change >= 0 ? "+" : ""}{t.change.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
