import { useState, useRef, useEffect } from "react";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { GlassCard } from "@/components/GlassCard";
import { analyzePortfolio } from "@/lib/mockApi";
import { Bot, Send, Loader2, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CopilotMessage } from "@/types/portfolio";

const SUGGESTED_PROMPTS = [
  "Analyze my banking stocks",
  "What's my portfolio risk level?",
  "Suggest rebalancing strategy",
  "Show sector concentration",
];

export default function Copilot() {
  const { assets, copilotMessages, addCopilotMessage, isAnalyzing, setIsAnalyzing, analysisStep, setAnalysisStep } =
    usePortfolioStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [copilotMessages, analysisStep]);

  const runAnalysis = async (prompt: string) => {
    addCopilotMessage({ role: "user", content: prompt, timestamp: Date.now() });
    setIsAnalyzing(true);
    setAnalysisStep(0);

    const steps = [
      "[1/3] Fetching NSE market data...",
      "[2/3] Analyzing portfolio trends and correlations...",
      "[3/3] Generating personalized recommendation...",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 1200));
      setAnalysisStep(i + 1);
    }

    await new Promise((r) => setTimeout(r, 800));

    const result = analyzePortfolio(assets);
    const response = `**📊 Portfolio Analysis Complete**\n\n**Risk Assessment:**\n${result.riskSummary}\n\n**Sector Breakdown:**\n${Object.entries(result.sectorConcentration)
      .map(([s, p]) => `• ${s}: ${p}%`)
      .join("\n")}\n\n**Recommendation:**\n${result.recommendation}`;

    addCopilotMessage({ role: "assistant", content: response, timestamp: Date.now() });
    setIsAnalyzing(false);
    setAnalysisStep(0);
  };

  const handleSend = () => {
    if (!input.trim() || isAnalyzing) return;
    const msg = input.trim();
    setInput("");
    runAnalysis(msg);
  };

  const steps = [
    "[1/3] Fetching NSE market data...",
    "[2/3] Analyzing portfolio trends and correlations...",
    "[3/3] Generating personalized recommendation...",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] animate-fade-in-up">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">AI Copilot</h2>
        <p className="text-sm text-muted-foreground">Your intelligent NSE portfolio assistant</p>
      </div>

      <GlassCard hover={false} className="flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-1">
          {copilotMessages.length === 0 && !isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse-glow">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Boma-Insight AI</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Ask me about your portfolio, risk analysis, or market insights. I'll analyze your NSE holdings in real-time.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => runAnalysis(p)}
                    className="glass-card px-3 py-2 text-xs text-muted-foreground hover:text-foreground text-left transition-all"
                  >
                    <Sparkles className="h-3 w-3 inline mr-1.5 text-primary" />
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {copilotMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary/20 text-foreground"
                    : "glass-card hover:!transform-none text-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="space-y-2">
                    {msg.content.split("\n").map((line, j) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return <p key={j} className="font-semibold text-primary">{line.replace(/\*\*/g, "")}</p>;
                      }
                      if (line.startsWith("•")) {
                        return <p key={j} className="text-muted-foreground pl-2">{line}</p>;
                      }
                      return line ? <p key={j} className="text-muted-foreground">{line}</p> : null;
                    })}
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex justify-start">
              <div className="glass-card hover:!transform-none max-w-[80%] px-4 py-3 space-y-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {i < analysisStep ? (
                      <BarChart3 className="h-3.5 w-3.5 text-success shrink-0" />
                    ) : i === analysisStep ? (
                      <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
                    )}
                    <span className={i <= analysisStep ? "text-foreground" : "text-muted-foreground"}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-3 mt-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your portfolio..."
              disabled={isAnalyzing}
              className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isAnalyzing}
              size="icon"
              className="bg-primary text-primary-foreground hover:bg-primary/80 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
