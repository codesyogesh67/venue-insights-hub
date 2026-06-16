"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, CheckCircle2, Filter, ExternalLink, Copy, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { VenueIQReport, AlertReview } from "@/lib/reportSchema";
import { Avatar } from "../shared/Avatar";
import { SourceBadge } from "../shared/SourceBadge";
import { StarRating } from "../shared/StarRating";
import { FilterChip } from "../shared/FilterChip";

type Time = "all" | "7d" | "30d" | "3m" | "6m" | "1y";
type Src = "all" | "google" | "yelp" | "tripadvisor";
type Stars = "all" | "1" | "2less" | "4plus";
type Status = "all" | "unanswered" | "fake";

function statusBadge(s: AlertReview["status"]) {
  if (s === "unanswered")
    return { color: "var(--color-accent)", icon: AlertTriangle, label: "UNANSWERED" };
  if (s === "fake")
    return { color: "var(--color-coral)", icon: ShieldAlert, label: "LIKELY FAKE" };
  return { color: "var(--color-emerald)", icon: CheckCircle2, label: "RESPONDED" };
}

function Metric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="card-vq card-vq-hover p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="font-mono-vq text-[10px] uppercase tracking-widest text-muted-vq">{label}</div>
      <div className="font-display text-3xl mt-2 font-semibold" style={{ color }}>{value}</div>
    </div>
  );
}

function ReviewItem({ r }: { r: AlertReview }) {
  const b = statusBadge(r.status);
  const Icon = b.icon;
  const [expanded, setExpanded] = useState(false);

  const borderColor =
    r.status === "unanswered" ? "var(--color-accent)"
      : r.status === "fake" ? "var(--color-coral)"
      : "var(--color-emerald)";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(r.suggestedOwnerResponse);
      toast.success("Response copied — ready to paste");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <motion.div
      
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="card-vq p-5 space-y-3"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="flex items-start gap-3">
        <Avatar letter={r.reviewerAvatarLetter} color={r.reviewerAvatarColor} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{r.reviewerName}</span>
            <span className="text-xs text-muted-vq">{r.reviewerProfile}</span>
            <SourceBadge source={r.source} />
            <StarRating stars={r.stars} />
            <span className="text-xs text-muted-vq font-mono-vq">{r.date}</span>
          </div>
        </div>
        <span className="badge-mono font-bold" style={{ background: `${b.color}22`, color: b.color }}>
          <Icon size={11} /> {b.label}
        </span>
      </div>

      <p className="italic text-sm leading-relaxed text-foreground/90">{r.reviewText}</p>

      {r.flagReason && (
        <div className="text-xs text-muted-vq border-l-2 border-accent-vq pl-3">
          {r.flagReason}
          {r.fakeSignals.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {r.fakeSignals.map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={r.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-vq hover:underline"
        >
          View original <ExternalLink size={12} />
        </a>
        {r.status !== "responded" && r.suggestedOwnerResponse && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-xs text-accent-vq hover:text-accent-bright"
          >
            <ChevronDown size={12} className={expanded ? "rotate-180 transition" : "transition"} />
            See suggested response
          </button>
        )}
        {r.status === "responded" && (
          <span className="text-xs text-emerald-vq">✓ {r.respondedAt}</span>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-4 rounded-lg space-y-3"
              style={{ background: "rgba(201,151,58,0.08)", border: "1px solid var(--color-border-strong)" }}
            >
              <p className="text-sm text-foreground/90 leading-relaxed">{r.suggestedOwnerResponse}</p>
              <button onClick={copy} className="btn-filled text-xs py-2 px-3">
                <Copy size={12} /> Copy Response
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ReviewsPanel({ report }: { report: VenueIQReport }) {
  const [time, setTime] = useState<Time>("all");
  const [src, setSrc] = useState<Src>("all");
  const [stars, setStars] = useState<Stars>("all");
  const [status, setStatus] = useState<Status>("all");

  const filtered = useMemo(() => {
    const days =
      time === "7d" ? 7 : time === "30d" ? 30 : time === "3m" ? 90 : time === "6m" ? 180 : time === "1y" ? 365 : Infinity;
    return report.reviews.reviewList.filter((r) => {
      if (r.daysAgo > days) return false;
      if (src !== "all" && r.source !== src) return false;
      if (stars === "1" && r.stars !== 1) return false;
      if (stars === "2less" && r.stars > 2) return false;
      if (stars === "4plus" && r.stars < 4) return false;
      if (status === "unanswered" && r.status !== "unanswered") return false;
      if (status === "fake" && r.status !== "fake") return false;
      return true;
    });
  }, [report.reviews.reviewList, time, src, stars, status]);

  const clear = () => {
    setTime("all"); setSrc("all"); setStars("all"); setStatus("all");
  };

  const sm = report.reviews.summaryMetrics;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Unanswered Negative" value={sm.unansweredNegative} color="var(--color-accent)" />
        <Metric label="Likely Fake" value={sm.likelyFake} color="var(--color-coral)" />
        <Metric label="Responded This Month" value={sm.respondedThisMonth} color="var(--color-emerald)" />
        <Metric label="Avg Response Time" value={`${sm.avgResponseTimeHours}h`} color="var(--color-accent-bright)" />
      </div>

      <section className="card-vq p-5 space-y-4">
        <div className="flex items-center gap-2 text-muted-vq">
          <Filter size={14} />
          <span className="font-mono-vq text-[11px] uppercase tracking-widest">Filters</span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-vq w-20 mt-1.5">Time</span>
            {(["all", "7d", "30d", "3m", "6m", "1y"] as Time[]).map((t) => (
              <FilterChip key={t} active={time === t} onClick={() => setTime(t)}>
                {t === "all" ? "All time" : t === "7d" ? "Last 7d" : t === "30d" ? "Last 30d" : t === "3m" ? "3 months" : t === "6m" ? "6 months" : "1 year"}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-vq w-20 mt-1.5">Source</span>
            {(["all", "google", "yelp", "tripadvisor"] as Src[]).map((s) => (
              <FilterChip key={s} active={src === s} onClick={() => setSrc(s)} tone="blue">
                {s === "all" ? "All sources" : s}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-vq w-20 mt-1.5">Stars</span>
            {(["all", "1", "2less", "4plus"] as Stars[]).map((s) => (
              <FilterChip key={s} active={stars === s} onClick={() => setStars(s)}>
                {s === "all" ? "All stars" : s === "1" ? "1★ only" : s === "2less" ? "2★ & below" : "4★+"}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-vq w-20 mt-1.5">Status</span>
            {(["all", "unanswered", "fake"] as Status[]).map((s) => (
              <FilterChip
                key={s}
                active={status === s}
                onClick={() => setStatus(s)}
                tone={s === "unanswered" ? "accent" : s === "fake" ? "coral" : "emerald"}
              >
                {s === "all" ? "All reviews" : s === "unanswered" ? "⚠ Unanswered" : "🚨 Suspicious"}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-accent-vq">
          <span className="font-mono-vq text-xs text-muted-vq">
            Showing {filtered.length} of {report.reviews.reviewList.length} reviews
          </span>
          <button onClick={clear} className="text-xs text-accent-vq hover:text-accent-bright">
            Clear filters
          </button>
        </div>
      </section>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="card-vq p-10 text-center text-muted-vq">
              <Filter size={28} className="mx-auto mb-3 opacity-50" />
              No reviews match these filters
            </div>
          ) : (
            filtered.map((r) => <ReviewItem key={r.reviewId} r={r} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
