"use client";
import { motion } from "framer-motion";
import type { VenueIQReport } from "@/lib/reportSchema";

export function StaffPanel({ report }: { report: VenueIQReport }) {
  const sm = report.staff.summaryMetrics;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="card-vq p-6">
        <h3 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq mb-4">
          Staff mentions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-vq font-mono-vq text-[10px] uppercase">
                <th className="pb-3 font-normal">Description</th>
                <th className="pb-3 font-normal text-right">Mentions</th>
                <th className="pb-3 font-normal text-right">Sentiment</th>
                <th className="pb-3 font-normal text-right">Shift</th>
              </tr>
            </thead>
            <tbody>
              {report.staff.staffMentions.entries.map((e, i) => {
                const color = e.sentimentDirection === "positive" ? "var(--color-emerald)" : "var(--color-coral)";
                return (
                  <tr key={i} className="border-t border-accent-vq">
                    <td className="py-3 pr-2">
                      <div className="text-foreground">{e.description}</div>
                      <div className="text-xs text-muted-vq mt-0.5">{e.noteForOwner}</div>
                    </td>
                    <td className="py-3 text-right font-mono-vq">{e.mentionCount}</td>
                    <td className="py-3 text-right font-mono-vq font-bold" style={{ color }}>
                      {e.sentimentScore > 0 ? "+" : ""}
                      {e.sentimentScore}%
                    </td>
                    <td className="py-3 text-right text-xs text-muted-vq">{e.typicalShift}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          className="mt-5 p-3 rounded-lg text-sm"
          style={{ background: "rgba(0,196,140,0.1)", border: "1px solid rgba(0,196,140,0.3)" }}
        >
          <span className="text-emerald-vq font-medium">★ Star performer · </span>
          Mara was named 34 times. Promote her on your storefront and social — she's a marketing asset.
        </div>
      </section>

      <section className="card-vq p-6">
        <h3 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq mb-4">
          Weekday vs Weekend service
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="rounded-lg p-4" style={{ background: "rgba(0,196,140,0.1)" }}>
            <div className="font-mono-vq text-[10px] uppercase text-muted-vq">Weekday</div>
            <div className="font-display text-5xl text-emerald-vq font-semibold">{sm.weekdayStaffSentimentPercent}%</div>
            <div className="text-xs text-muted-vq mt-1">positive staff mentions</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="rounded-lg p-4" style={{ background: "rgba(255,92,92,0.1)" }}>
            <div className="font-mono-vq text-[10px] uppercase text-muted-vq">Weekend</div>
            <div className="font-display text-5xl text-coral-vq font-semibold">{sm.weekendStaffSentimentPercent}%</div>
            <div className="text-xs text-muted-vq mt-1">{sm.sentimentGapPoints}pt gap</div>
          </motion.div>
        </div>
        <div className="space-y-2 mb-5">
          {report.staff.weekendReviewQuotes.quotes.map((q, i) => (
            <div key={i} className="p-3 rounded text-sm italic text-foreground/80" style={{ borderLeft: "3px solid var(--color-coral)", background: "rgba(255,92,92,0.05)" }}>
              "{q.text}"
              <div className="not-italic text-xs text-muted-vq mt-1 font-mono-vq">
                {q.source} · {q.daysAgo}d ago
              </div>
            </div>
          ))}
        </div>
        <div
          className="p-3 rounded-lg text-sm"
          style={{ background: "rgba(201,151,58,0.1)", border: "1px solid var(--color-border-strong)" }}
        >
          <span className="text-accent-vq font-medium">Recommendation · </span>
          {report.staff.recommendation}
        </div>
      </section>
    </div>
  );
}
