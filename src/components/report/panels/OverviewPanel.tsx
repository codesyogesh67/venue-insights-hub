"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrendingUp, TrendingDown, X } from "lucide-react";
import type { VenueIQReport, MetricCard, TagWithEvidence } from "@/lib/reportSchema";
import { ReviewCard } from "../shared/ReviewCard";

function Metric({ label, m, color }: { label: string; m: MetricCard; color: string }) {
  const Trend = m.trendDirection === "up" ? TrendingUp : TrendingDown;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card-vq card-vq-hover p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="font-mono-vq text-[10px] uppercase tracking-widest text-muted-vq">{label}</div>
      <div className="font-display text-4xl mt-2 font-semibold" style={{ color }}>
        {m.value}
      </div>
      <div className="text-xs text-muted-vq mt-1">{m.subLabel}</div>
      <div className="flex items-center gap-1 mt-3 text-xs" style={{ color }}>
        <Trend size={12} />
        <span>{m.trend}</span>
      </div>
    </motion.div>
  );
}

function TagChip({
  tag,
  active,
  tone,
  onClick,
}: {
  tag: TagWithEvidence;
  active: boolean;
  tone: "emerald" | "coral";
  onClick: () => void;
}) {
  const color = tone === "emerald" ? "var(--color-emerald)" : "var(--color-coral)";
  return (
    <button
      onClick={onClick}
      className="card-vq px-3 py-2 text-sm transition-all"
      style={
        active
          ? { borderColor: color, boxShadow: `0 0 20px ${color}33` }
          : undefined
      }
    >
      <span className="text-foreground">{tag.label}</span>
      <span className="ml-2 font-mono-vq text-xs" style={{ color }}>
        {tag.mentionCount}
      </span>
    </button>
  );
}

export function OverviewPanel({ report }: { report: VenueIQReport }) {
  const [openTag, setOpenTag] = useState<string | null>(null);
  const allTags = [...report.overview.praiseTags.tags, ...report.overview.complaintTags.tags];
  const open = allTags.find((t) => t.id === openTag);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Positive Reviews" m={report.overview.metrics.positiveReviews} color="var(--color-emerald)" />
        <Metric label="Negative Reviews" m={report.overview.metrics.negativeReviews} color="var(--color-coral)" />
        <Metric label="Avg Response Time" m={report.overview.metrics.avgResponseTime} color="var(--color-accent)" />
        <Metric label="Rating Trajectory" m={report.overview.metrics.ratingTrajectory} color="var(--color-accent-bright)" />
      </div>

      <section className="card-vq p-6">
        <h3 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq mb-4">
          Monthly Review Volume
        </h3>
        <div className="flex items-end gap-2 h-40">
          {report.overview.monthlyVolume.months.map((m, i) => {
            const max = Math.max(...report.overview.monthlyVolume.months.map((x) => x.reviewCount));
            const h = (m.reviewCount / max) * 100;
            const color =
              m.sentiment === "positive"
                ? "var(--color-emerald)"
                : m.sentiment === "mixed"
                  ? "var(--color-accent)"
                  : "var(--color-coral)";
            const isLast = i === report.overview.monthlyVolume.months.length - 1;
            return (
              <div key={`${m.month}-${m.year}`} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.04 }}
                  style={{
                    background: color,
                    width: "100%",
                    borderRadius: 4,
                    minHeight: 4,
                    filter: isLast ? `drop-shadow(0 0 8px ${color})` : undefined,
                  }}
                />
                <span className="font-mono-vq text-[9px] text-muted-vq">{m.month}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="font-mono-vq text-[11px] uppercase tracking-widest text-emerald-vq mb-3">
          What customers love
        </h3>
        <div className="flex flex-wrap gap-2">
          {report.overview.praiseTags.tags.map((t) => (
            <TagChip
              key={t.id}
              tag={t}
              tone="emerald"
              active={openTag === t.id}
              onClick={() => setOpenTag(openTag === t.id ? null : t.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-mono-vq text-[11px] uppercase tracking-widest text-coral-vq mb-3">
          What customers complain about
        </h3>
        <div className="flex flex-wrap gap-2">
          {report.overview.complaintTags.tags.map((t) => (
            <TagChip
              key={t.id}
              tag={t}
              tone="coral"
              active={openTag === t.id}
              onClick={() => setOpenTag(openTag === t.id ? null : t.id)}
            />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card-vq p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-2xl">{open.label}</h4>
                <button
                  onClick={() => setOpenTag(null)}
                  className="text-muted-vq hover:text-foreground"
                  aria-label="Close evidence"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {open.reviews.map((r) => (
                  <ReviewCard key={r.reviewerId} review={r} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section
        className="card-vq p-6 space-y-3"
        style={{ borderLeft: "3px solid var(--color-accent)" }}
      >
        <h3 className="font-mono-vq text-[11px] uppercase tracking-widest text-accent-vq">
          AI Summary
        </h3>
        {report.overview.aiSummary.paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-[15px] leading-[1.9] text-foreground/90"
            dangerouslySetInnerHTML={{
              __html: p.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>'),
            }}
          />
        ))}
      </section>
    </div>
  );
}
