"use client";
import { motion } from "framer-motion";
import type { VenueIQReport } from "@/lib/reportSchema";
import { SentimentBar } from "../shared/SentimentBar";

export function SentimentPanel({ report }: { report: VenueIQReport }) {
  const { byCategory, weekdayVsWeekend, mostMentionedItems } = report.sentiment;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="card-vq p-6">
        <h3 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq mb-4">
          Sentiment by category
        </h3>
        <div className="space-y-4">
          {byCategory.categories.map((c) => (
            <SentimentBar key={c.category} label={c.category} score={c.score} level={c.level} />
          ))}
        </div>
      </section>

      <div className="space-y-6">
        <section className="card-vq p-6">
          <h3 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq mb-4">
            Weekday vs Weekend
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg p-3" style={{ background: "rgba(0,196,140,0.1)" }}>
              <div className="text-xs text-muted-vq font-mono-vq uppercase">Weekday</div>
              <div className="font-display text-3xl text-emerald-vq font-semibold">
                {report.staff.summaryMetrics.weekdayStaffSentimentPercent}%
              </div>
            </div>
            <div className="rounded-lg p-3" style={{ background: "rgba(255,92,92,0.1)" }}>
              <div className="text-xs text-muted-vq font-mono-vq uppercase">Weekend</div>
              <div className="font-display text-3xl text-coral-vq font-semibold">
                {report.staff.summaryMetrics.weekendStaffSentimentPercent}%
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              {weekdayVsWeekend.weekday.metrics.map((m) => (
                <SentimentBar key={m.label} label={m.label} score={m.score} />
              ))}
            </div>
            <div className="space-y-3">
              {weekdayVsWeekend.weekend.metrics.map((m) => (
                <SentimentBar key={m.label} label={m.label} score={m.score} />
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-4 p-3 rounded-lg text-sm"
            style={{ background: "rgba(201,151,58,0.1)", border: "1px solid var(--color-border-strong)" }}
          >
            <span className="text-accent-vq font-medium">Key finding · </span>
            {weekdayVsWeekend.keyFinding}
          </motion.div>
        </section>

        <section className="card-vq p-6">
          <h3 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq mb-4">
            Most mentioned items
          </h3>
          <div className="space-y-2">
            {mostMentionedItems.items.map((it) => {
              const max = Math.max(...mostMentionedItems.items.map((x) => x.mentionCount));
              const w = (it.mentionCount / max) * 100;
              const color =
                it.sentimentColor === "emerald"
                  ? "var(--color-emerald)"
                  : it.sentimentColor === "coral"
                    ? "var(--color-coral)"
                    : "var(--color-accent)";
              return (
                <div key={it.item} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-foreground/80 shrink-0">{it.item}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden bg-surface2">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${w}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      style={{ background: color, height: "100%" }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono-vq text-xs" style={{ color }}>
                    {it.mentionCount}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
