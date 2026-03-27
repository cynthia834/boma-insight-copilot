export interface Asset {
  symbol: string;
  shares: number;
  avg_price: number;
  current_price: number;
  sector: string;
}

export interface TickerItem {
  symbol: string;
  price: number;
  change: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface RiskAlert {
  symbol: string;
  loss_pct: number;
  message: string;
}

export interface CopilotMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface AnalysisResult {
  riskSummary: string;
  sectorConcentration: Record<string, number>;
  recommendation: string;
}
