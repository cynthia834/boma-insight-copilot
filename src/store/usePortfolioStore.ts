import { create } from "zustand";
import type { Asset, TickerItem, ChartDataPoint, CopilotMessage } from "@/types/portfolio";

interface PortfolioState {
  assets: Asset[];
  ticker: TickerItem[];
  chartData: ChartDataPoint[];
  copilotMessages: CopilotMessage[];
  isAnalyzing: boolean;
  analysisStep: number;

  setAssets: (assets: Asset[]) => void;
  updatePrice: (symbol: string, newPrice: number) => void;
  simulatePriceUpdate: () => void;
  addCopilotMessage: (msg: CopilotMessage) => void;
  setIsAnalyzing: (v: boolean) => void;
  setAnalysisStep: (step: number) => void;
  clearCopilotMessages: () => void;

  // Computed
  totalValue: () => number;
  totalCost: () => number;
  pnl: () => number;
  returnPct: () => number;
}

const generateChartData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let value = 180000;
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    value += (Math.random() - 0.48) * 4000;
    value = Math.max(value, 140000);
    data.push({
      date: date.toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
      value: Math.round(value),
    });
  }
  return data;
};

const initialAssets: Asset[] = [
  { symbol: "SCOM", shares: 5000, avg_price: 15, current_price: 14.5, sector: "Telecom" },
  { symbol: "EQTY", shares: 3000, avg_price: 40, current_price: 42.8, sector: "Banking" },
  { symbol: "COOP", shares: 4000, avg_price: 12, current_price: 11.6, sector: "Banking" },
  { symbol: "KCB", shares: 2500, avg_price: 25, current_price: 26.3, sector: "Banking" },
];

const initialTicker: TickerItem[] = [
  { symbol: "SCOM", price: 14.5, change: -3.33 },
  { symbol: "EQTY", price: 42.8, change: 7.0 },
  { symbol: "COOP", price: 11.6, change: -3.33 },
  { symbol: "KCB", price: 26.3, change: 5.2 },
  { symbol: "BAT", price: 320.0, change: 1.2 },
  { symbol: "ABSA", price: 13.4, change: -0.5 },
];

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  assets: initialAssets,
  ticker: initialTicker,
  chartData: generateChartData(),
  copilotMessages: [],
  isAnalyzing: false,
  analysisStep: 0,

  setAssets: (assets) => set({ assets }),

  updatePrice: (symbol, newPrice) =>
    set((state) => ({
      assets: state.assets.map((a) =>
        a.symbol === symbol ? { ...a, current_price: newPrice } : a
      ),
      ticker: state.ticker.map((t) =>
        t.symbol === symbol
          ? { ...t, price: newPrice, change: ((newPrice - t.price) / t.price) * 100 + t.change }
          : t
      ),
    })),

  simulatePriceUpdate: () => {
    const { assets } = get();
    assets.forEach((asset) => {
      const variance = asset.current_price * (Math.random() * 0.02 - 0.01);
      const newPrice = Math.round((asset.current_price + variance) * 100) / 100;
      get().updatePrice(asset.symbol, newPrice);
    });
  },

  addCopilotMessage: (msg) =>
    set((state) => ({ copilotMessages: [...state.copilotMessages, msg] })),

  setIsAnalyzing: (v) => set({ isAnalyzing: v }),
  setAnalysisStep: (step) => set({ analysisStep: step }),
  clearCopilotMessages: () => set({ copilotMessages: [] }),

  totalValue: () => get().assets.reduce((sum, a) => sum + a.shares * a.current_price, 0),
  totalCost: () => get().assets.reduce((sum, a) => sum + a.shares * a.avg_price, 0),
  pnl: () => get().totalValue() - get().totalCost(),
  returnPct: () => {
    const cost = get().totalCost();
    return cost === 0 ? 0 : (get().pnl() / cost) * 100;
  },
}));
