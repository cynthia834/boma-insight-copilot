import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "red" | "none";
  hover?: boolean;
}

export function GlassCard({ children, className = "", glow = "none", hover = true }: GlassCardProps) {
  const glowClass = glow === "cyan" ? "glow-cyan" : glow === "red" ? "glow-red" : "";
  const hoverClass = hover ? "" : "hover:!transform-none";

  return (
    <div className={`glass-card p-5 ${glowClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}
