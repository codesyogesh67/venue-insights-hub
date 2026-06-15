"use client";
import { motion } from "framer-motion";

interface SentimentBarProps {
  label: string;
  score: number;
  level?: "high" | "mid" | "low";
}
export function SentimentBar({ label, score, level }: SentimentBarProps) {
  const lvl = level ?? (score >= 75 ? "high" : score >= 50 ? "mid" : "low");
  const color =
    lvl === "high" ? "var(--color-emerald)" : lvl === "mid" ? "var(--color-accent)" : "var(--color-coral)";

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-foreground">{label}</span>
        <span className="font-mono-vq text-sm font-bold" style={{ color }}>
          {score}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-surface2">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ background: color, height: "100%" }}
        />
      </div>
    </div>
  );
}
