"use client";
import { motion } from "framer-motion";
import type { VenueIQReport } from "@/lib/reportSchema";

export function GapsPanel({ report }: { report: VenueIQReport }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-vq italic">
        Identified from aggregating demand signals across all venues within 1 mile.
      </p>
      <section>
        <h3 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq mb-3">
          Demand signals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {report.gaps.demandSignals.signals.map((s, i) => (
            <motion.div
              key={s.topic}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card-vq card-vq-hover p-4"
            >
              <div className="font-medium text-foreground text-sm">{s.topic}</div>
              <div className="font-display text-4xl text-accent-bright font-semibold mt-1">
                {s.requestCount}
              </div>
              <div className="text-xs text-muted-vq">requests</div>
              <div className="text-xs text-muted-vq mt-2">{s.note}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq">
          Opportunities & warnings
        </h3>
        {report.gaps.gapItems.map((g, i) => {
          const isOpp = g.type === "opportunity";
          const color = isOpp ? "var(--color-emerald)" : "var(--color-coral)";
          const bg = isOpp ? "rgba(0,196,140,0.08)" : "rgba(255,92,92,0.08)";
          return (
            <motion.div
              key={g.gapId}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card-vq p-4 flex items-start gap-4"
              style={{ background: bg, borderLeft: `3px solid ${color}` }}
            >
              <div className="text-2xl">{g.icon}</div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h4 className="font-display text-xl font-semibold">{g.title}</h4>
                  <span className="badge-mono font-bold" style={{ background: `${color}22`, color }}>
                    {g.demandCount} signals
                  </span>
                </div>
                <p className="text-sm text-foreground/85 mt-1 leading-relaxed">{g.description}</p>
                <div className="text-xs mt-2" style={{ color }}>
                  {g.estimatedImpact}
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
