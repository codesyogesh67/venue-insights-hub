"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { VenueIQReport, CompetitorVenue } from "@/lib/reportSchema";
import { FilterChip } from "../shared/FilterChip";
import { ReviewCard } from "../shared/ReviewCard";

type Dist = "all" | 0.25 | 0.5 | 1 | 2;
type Sort = "distance" | "rating_desc" | "rating_asc";

function getMetricScore(c: CompetitorVenue, key: string): number {
  if (key === "food") return c.scores.foodQuality;
  if (key === "coffee") return c.scores.coffeeScore;
  if (key === "speed") return c.scores.serviceSpeed;
  if (key === "value") return c.scores.valueMoney;
  return c.scores.overallRating;
}

function CompetitorRow({ c }: { c: CompetitorVenue }) {
  const [open, setOpen] = useState(false);
  const vsColor =
    c.vsYou === "stronger" ? "var(--color-coral)" : c.vsYou === "weaker" ? "var(--color-emerald)" : "var(--color-accent)";
  return (
    <motion.div layout className="card-vq p-5 space-y-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h4 className="font-display text-2xl font-semibold">{c.name}</h4>
            <span className="font-mono-vq text-xs text-muted-vq">{c.distance}</span>
          </div>
          <div className="text-sm text-muted-vq mt-0.5">{c.address}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="font-display text-3xl text-accent-bright font-semibold">{c.overallRating}★</div>
          <span className="badge-mono font-bold" style={{ background: `${vsColor}22`, color: vsColor }}>
            {c.vsYou}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="p-2 rounded text-sm" style={{ background: "rgba(0,196,140,0.08)" }}>
          <span className="text-emerald-vq text-xs font-mono-vq uppercase">Best at: </span>
          {c.knownFor}
        </div>
        <div className="p-2 rounded text-sm" style={{ background: "rgba(255,92,92,0.08)" }}>
          <span className="text-coral-vq text-xs font-mono-vq uppercase">Weak at: </span>
          {c.weakPoint}
        </div>
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-accent-vq hover:text-accent-bright inline-flex items-center gap-1"
      >
        <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
        See {c.reviews.length} customer reviews
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 md:grid-cols-2 pt-3">
              {c.reviews.map((r) => (
                <ReviewCard key={r.reviewerId} review={r} compact />
              ))}
            </div>
            <div
              className="mt-3 p-3 rounded-lg text-sm"
              style={{ background: "rgba(0,196,140,0.1)", border: "1px solid rgba(0,196,140,0.3)" }}
            >
              <span className="text-emerald-vq font-medium font-mono-vq text-[10px] uppercase tracking-widest">
                Your opportunity ·{" "}
              </span>
              {c.opportunityForYou}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function CompetitorsPanel({ report }: { report: VenueIQReport }) {
  const [dist, setDist] = useState<Dist>("all");
  const [sort, setSort] = useState<Sort>("distance");

  const venues = useMemo(() => {
    let list = report.competitors.venues.slice();
    if (dist !== "all") list = list.filter((v) => v.distanceMiles <= dist);
    if (sort === "distance") list.sort((a, b) => a.distanceMiles - b.distanceMiles);
    if (sort === "rating_desc") list.sort((a, b) => b.overallRating - a.overallRating);
    if (sort === "rating_asc") list.sort((a, b) => a.overallRating - b.overallRating);
    return list;
  }, [report.competitors.venues, dist, sort]);

  const h2h = report.competitors.headToHead;
  return (
    <div className="space-y-6">
      <section className="card-vq p-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-vq w-20 mt-1.5">Distance</span>
          {(["all", 0.25, 0.5, 1, 2] as Dist[]).map((d) => (
            <FilterChip key={String(d)} active={dist === d} onClick={() => setDist(d)}>
              {d === "all" ? "All" : `${d} mi`}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-vq w-20 mt-1.5">Sort by</span>
          {(["distance", "rating_desc", "rating_asc"] as Sort[]).map((s) => (
            <FilterChip key={s} active={sort === s} onClick={() => setSort(s)}>
              {s === "distance" ? "Distance" : s === "rating_desc" ? "Rating ↓" : "Rating ↑"}
            </FilterChip>
          ))}
        </div>
        <div className="text-xs text-muted-vq font-mono-vq pt-1">{venues.length} venues shown</div>
      </section>

      <section className="card-vq p-6">
        <h3 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq mb-4">
          Head-to-head comparison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {h2h.metrics.map((m) => (
            <div key={m.metricKey} className="space-y-2">
              <div className="text-sm font-medium">{m.metricLabel}</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-28 text-xs text-foreground shrink-0">You</span>
                  <div className="flex-1 h-3 rounded bg-surface2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.yourScore}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      style={{ background: "var(--color-accent)", height: "100%" }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono-vq text-xs text-accent-bright">{m.yourScore}</span>
                </div>
                {venues.slice(0, 3).map((c) => {
                  const s = getMetricScore(c, m.metricKey);
                  const color =
                    s > m.yourScore ? "var(--color-coral)" : s < m.yourScore ? "var(--color-emerald)" : "var(--color-muted)";
                  return (
                    <div key={c.venueId} className="flex items-center gap-2">
                      <span className="w-28 text-xs text-muted-vq shrink-0 truncate">{c.name}</span>
                      <div className="flex-1 h-2 rounded bg-surface2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${s}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8 }}
                          style={{ background: color, height: "100%", opacity: 0.7 }}
                        />
                      </div>
                      <span className="w-10 text-right font-mono-vq text-xs" style={{ color }}>{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(0,196,140,0.1)" }}>
            <div className="font-mono-vq text-[10px] uppercase text-emerald-vq mb-1">You win on</div>
            {h2h.winSummary}
          </div>
          <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(255,92,92,0.1)" }}>
            <div className="font-mono-vq text-[10px] uppercase text-coral-vq mb-1">You lose on</div>
            {h2h.loseSummary}
          </div>
          <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(201,151,58,0.1)" }}>
            <div className="font-mono-vq text-[10px] uppercase text-accent-vq mb-1">Biggest gap</div>
            {h2h.biggestGap}
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {venues.map((c) => (
          <CompetitorRow key={c.venueId} c={c} />
        ))}
      </div>
    </div>
  );
}
