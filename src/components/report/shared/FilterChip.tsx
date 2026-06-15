"use client";
import { cn } from "@/lib/utils";

interface Props {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "accent" | "blue" | "emerald" | "coral";
}
export function FilterChip({ active, onClick, children, tone = "accent" }: Props) {
  const colors = {
    accent: { bg: "var(--color-accent)", text: "var(--color-bg)" },
    blue: { bg: "var(--color-blue)", text: "#fff" },
    emerald: { bg: "var(--color-emerald)", text: "#001a12" },
    coral: { bg: "var(--color-coral)", text: "#fff" },
  }[tone];
  return (
    <button
      onClick={onClick}
      className={cn(
        "font-mono-vq text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-md border transition-all",
        active ? "border-transparent" : "border-accent-vq text-muted-vq hover:text-foreground",
      )}
      style={active ? { background: colors.bg, color: colors.text } : undefined}
    >
      {children}
    </button>
  );
}
