"use client";
import { Link } from "@tanstack/react-router";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { VenueIQReport } from "@/lib/reportSchema";
import { cn } from "@/lib/utils";

// ─── helpers ────────────────────────────────────────────────────────────────

function gradeFromScore(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "A−";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "B−";
  if (score >= 58) return "C+";
  if (score >= 50) return "C";
  return "D";
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "var(--color-emerald)";
  if (grade.startsWith("B")) return "var(--color-accent-bright)";
  if (grade.startsWith("C")) return "var(--color-coral)";
  return "var(--color-coral)";
}

type UrgencyLevel = "urgent" | "this-week" | "quick-win";

interface ActionItem {
  urgency: UrgencyLevel;
  title: string;
  description: string;
}

const URGENCY_META: Record<
  UrgencyLevel,
  { label: string; bg: string; text: string; iconBg: string }
> = {
  urgent: {
    label: "Urgent",
    bg: "rgba(255,92,92,0.08)",
    text: "var(--color-coral)",
    iconBg: "rgba(255,92,92,0.12)",
  },
  "this-week": {
    label: "This week",
    bg: "rgba(201,151,58,0.08)",
    text: "var(--color-accent-bright)",
    iconBg: "rgba(201,151,58,0.12)",
  },
  "quick-win": {
    label: "Quick win",
    bg: "rgba(0,196,140,0.08)",
    text: "var(--color-emerald)",
    iconBg: "rgba(0,196,140,0.12)",
  },
};

// ─── sub-components ──────────────────────────────────────────────────────────

function ReportHeader({ report }: { report: VenueIQReport }) {
  return (
    <header
      className="border-b border-accent-vq px-6 py-5"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-mono-vq text-[10px] uppercase tracking-widest text-muted-vq mb-1">
            VenueIQ · Quick Summary
          </div>
          <h1 className="font-display text-2xl text-foreground leading-tight">
            {report.venue.name}
          </h1>
          <p className="text-xs text-muted-vq mt-0.5">
            {report.venue.address}, {report.venue.neighborhood} ·{" "}
            {report.meta.reportDate}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="badge-mono text-muted-vq text-[10px]">
            {report.sidebar.totalReviewsAnalysed} reviews analysed
          </span>
          <Link
            to="/report/$slug"
            params={{ slug: "" }}
            className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
            title="Open full detailed report"
          >
            Full report <ExternalLink size={11} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function GradeCard({ report }: { report: VenueIQReport }) {
  const score = report.sidebar.healthScore;
  const grade = gradeFromScore(score);
  const color = gradeColor(grade);

  const posChange =
    (report.overview.metrics.positiveReviews.trend ?? "").includes("+")
      ? "up"
      : "down";

  return (
    <div
      className="card-vq p-6 flex gap-6 items-center"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="text-center shrink-0">
        <div
          className="font-display leading-none"
          style={{ fontSize: "4rem", color }}
        >
          {grade}
        </div>
        <div className="font-mono-vq text-[9px] uppercase tracking-widest text-muted-vq mt-1">
          Overall health
        </div>
      </div>

      <div className="flex-1 space-y-2 text-sm">
        <p className="text-foreground leading-relaxed">
          {report.sidebar.healthScoreVerdict}
        </p>
        <div className="flex items-center gap-2">
          {posChange === "up" ? (
            <TrendingUp size={14} style={{ color: "var(--color-emerald)" }} />
          ) : (
            <TrendingDown size={14} style={{ color: "var(--color-coral)" }} />
          )}
          <span className="text-xs text-muted-vq">
            Rating moved{" "}
            <strong style={{ color: "var(--color-accent-bright)" }}>
              {report.sidebar.ratingFrom} → {report.sidebar.ratingTo}
            </strong>{" "}
            in the last {report.sidebar.trendPeriodMonths} months
          </span>
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  trend,
  trendDir,
  highlight,
}: {
  label: string;
  value: string;
  trend: string;
  trendDir: "up" | "down";
  highlight?: boolean;
}) {
  const isGoodUp = label.toLowerCase().includes("positive");
  const isGoodDown =
    label.toLowerCase().includes("negative") ||
    label.toLowerCase().includes("response");

  const good =
    (isGoodUp && trendDir === "up") || (isGoodDown && trendDir === "down");

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-md",
        highlight ? "bg-surface2" : "",
      )}
    >
      <span className="text-sm text-muted-vq">{label}</span>
      <div className="text-right">
        <div
          className="font-display text-xl font-semibold"
          style={{ color: "var(--color-accent-bright)" }}
        >
          {value}
        </div>
        <div
          className="text-[11px] font-mono-vq flex items-center gap-0.5 justify-end"
          style={{ color: good ? "var(--color-emerald)" : "var(--color-coral)" }}
        >
          {trendDir === "up" ? (
            <TrendingUp size={10} />
          ) : (
            <TrendingDown size={10} />
          )}
          {trend}
        </div>
      </div>
    </div>
  );
}

function KeyNumbers({ report }: { report: VenueIQReport }) {
  const m = report.overview.metrics;
  return (
    <div className="card-vq overflow-hidden">
      <div className="px-4 pt-4 pb-2 border-b border-accent-vq">
        <div className="font-mono-vq text-[10px] uppercase tracking-widest text-muted-vq">
          Key numbers at a glance
        </div>
      </div>
      <div className="divide-y divide-[rgba(255,255,255,0.05)]">
        <MetricRow
          label="Happy customers"
          value={m.positiveReviews.value}
          trend={m.positiveReviews.trend ?? ""}
          trendDir={m.positiveReviews.trendDirection === "up" ? "up" : "down"}
          highlight
        />
        <MetricRow
          label="Unhappy customers"
          value={m.negativeReviews.value}
          trend={m.negativeReviews.trend ?? ""}
          trendDir={m.negativeReviews.trendDirection === "up" ? "up" : "down"}
        />
        <MetricRow
          label="Average reply time"
          value={m.avgResponseTime.value}
          trend={m.avgResponseTime.trend ?? ""}
          trendDir={
            m.avgResponseTime.trendDirection === "up" ? "up" : "down"
          }
          highlight
        />
        <MetricRow
          label="Rating trajectory"
          value={m.ratingTrajectory.value}
          trend={m.ratingTrajectory.trend ?? ""}
          trendDir={
            m.ratingTrajectory.trendDirection === "up" ? "up" : "down"
          }
        />
      </div>
    </div>
  );
}

function WhatCustomersSay({ report }: { report: VenueIQReport }) {
  const praiseTags = report.overview.praiseTags.tags.slice(0, 5);
  const complaintTags = report.overview.complaintTags.tags.slice(0, 4);

  return (
    <div className="card-vq p-5 space-y-5">
      <div className="font-mono-vq text-[10px] uppercase tracking-widest text-muted-vq">
        What customers keep saying
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-vq mb-2">People love ❤️</div>
        <div className="flex flex-wrap gap-2">
          {praiseTags.map((t) => (
            <span
              key={t.id}
              className="text-xs px-3 py-1.5 rounded-full font-mono-vq"
              style={{
                background: "rgba(0,196,140,0.1)",
                color: "var(--color-emerald)",
                border: "1px solid rgba(0,196,140,0.2)",
              }}
            >
              {t.label}{" "}
              <span style={{ opacity: 0.6 }}>· {t.mentionCount}×</span>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-vq mb-2">People complain about 😤</div>
        <div className="flex flex-wrap gap-2">
          {complaintTags.map((t) => (
            <span
              key={t.id}
              className="text-xs px-3 py-1.5 rounded-full font-mono-vq"
              style={{
                background: "rgba(255,92,92,0.1)",
                color: "var(--color-coral)",
                border: "1px solid rgba(255,92,92,0.2)",
              }}
            >
              {t.label}{" "}
              <span style={{ opacity: 0.6 }}>· {t.mentionCount}×</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryBar({
  label,
  score,
  level,
  note,
}: {
  label: string;
  score: number;
  level: "high" | "mid" | "low";
  note: string;
}) {
  const color =
    level === "high"
      ? "var(--color-emerald)"
      : level === "mid"
        ? "var(--color-accent-bright)"
        : "var(--color-coral)";

  const letterGrade =
    level === "high" ? "A" : level === "mid" ? "B" : "C−";

  return (
    <div className="space-y-1.5 py-3 border-b border-accent-vq last:border-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-foreground">{label}</span>
        <span
          className="font-mono-vq text-sm font-bold shrink-0"
          style={{ color }}
        >
          {letterGrade}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--color-surface2)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <p className="text-[11px] text-muted-vq leading-relaxed">{note}</p>
    </div>
  );
}

function ReportCard({ report }: { report: VenueIQReport }) {
  const categories = report.sentiment.byCategory.categories;
  return (
    <div className="card-vq p-5">
      <div className="font-mono-vq text-[10px] uppercase tracking-widest text-muted-vq mb-3">
        Your report card
      </div>
      <div>
        {categories.map((c) => (
          <CategoryBar
            key={c.category}
            label={c.category}
            score={c.score}
            level={c.level}
            note={c.noteForOwner}
          />
        ))}
      </div>
    </div>
  );
}

function buildActionItems(report: VenueIQReport): ActionItem[] {
  const items: ActionItem[] = [];

  // Pull top 3 prioritised actions from the actions section if available
  const actions = report.actions?.prioritised ?? [];

  for (const a of actions.slice(0, 3)) {
    const urgency: UrgencyLevel =
      a.priority === "high"
        ? "urgent"
        : a.priority === "medium"
          ? "this-week"
          : "quick-win";
    items.push({
      urgency,
      title: a.action,
      description: a.rationale,
    });
  }

  // Fallback: derive from complaint tags if no actions section
  if (items.length === 0) {
    const topComplaint = report.overview.complaintTags.tags[0];
    if (topComplaint) {
      items.push({
        urgency: "urgent",
        title: `Address: "${topComplaint.label}"`,
        description: `This complaint appears ${topComplaint.mentionCount} times across your reviews — it's your #1 pain point right now.`,
      });
    }
    if (report.sidebar.reviewsNeedResponse > 0) {
      items.push({
        urgency: "this-week",
        title: `Reply to ${report.sidebar.reviewsNeedResponse} unanswered reviews`,
        description:
          "Businesses that respond to reviews get more repeat visits. Even a brief thank-you counts.",
      });
    }
    const weekdayVsWeekend = report.sentiment.weekdayVsWeekend;
    if (weekdayVsWeekend.gapPoints > 5) {
      items.push({
        urgency: "quick-win",
        title: "Look at your weekend staffing",
        description: weekdayVsWeekend.keyFinding,
      });
    }
  }

  return items;
}

function ActionPlan({ report }: { report: VenueIQReport }) {
  const items = buildActionItems(report);

  return (
    <div className="card-vq p-5 space-y-1">
      <div className="font-mono-vq text-[10px] uppercase tracking-widest text-muted-vq mb-4">
        Fix these{" "}
        {items.length === 1
          ? "this week"
          : `${items.length} things — prioritised`}
      </div>
      {items.map((item, i) => {
        const meta = URGENCY_META[item.urgency];
        return (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-lg"
            style={{ background: meta.bg }}
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: meta.iconBg }}
            >
              {item.urgency === "urgent" ? (
                <AlertTriangle size={15} style={{ color: meta.text }} />
              ) : (
                <CheckCircle size={15} style={{ color: meta.text }} />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">
                  {item.title}
                </span>
                <span
                  className="badge-mono text-[10px]"
                  style={{ color: meta.text, background: meta.iconBg }}
                >
                  {meta.label}
                </span>
              </div>
              <p className="text-xs text-muted-vq leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CompetitorSnapshot({ report }: { report: VenueIQReport }) {
  const competitors = report.competitors.venues ?? [];
  const your = report.sidebar.googleRating;
  const venueName = report.venue.name;

  if (competitors.length === 0) return null;

  return (
    <div className="card-vq p-5">
      <div className="font-mono-vq text-[10px] uppercase tracking-widest text-muted-vq mb-4">
        How you stack up nearby
      </div>
      <div className="space-y-0 divide-y divide-[rgba(255,255,255,0.05)]">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {venueName}
            </span>
            <span
              className="badge-mono text-[10px]"
              style={{
                background: "rgba(201,151,58,0.15)",
                color: "var(--color-accent-bright)",
              }}
            >
              you
            </span>
          </div>
          <span
            className="font-mono-vq font-bold text-sm"
            style={{ color: "var(--color-accent-bright)" }}
          >
            {your}
          </span>
        </div>
        {competitors.slice(0, 4).map((c) => (
          <div
            key={c.name}
            className="flex items-center justify-between py-3"
          >
            <span className="text-sm text-muted-vq">{c.name}</span>
            <span
              className="font-mono-vq font-bold text-sm"
              style={{
                color:
                  parseFloat(c.googleRating) > parseFloat(your)
                    ? "var(--color-coral)"
                    : "var(--color-emerald)",
              }}
            >
              {c.googleRating}
            </span>
          </div>
        ))}
      </div>
      {report.competitors.winSummary && (
        <div
          className="mt-4 text-xs text-muted-vq p-3 rounded-md leading-relaxed"
          style={{ background: "var(--color-surface2)" }}
        >
          💡 {report.competitors.winSummary}
        </div>
      )}
    </div>
  );
}

function BadDayPattern({ report }: { report: VenueIQReport }) {
  const wvw = report.sentiment.weekdayVsWeekend;
  const weekdayScore = wvw.weekday.metrics[0]?.score ?? 80;
  const weekendScore = wvw.weekend.metrics[0]?.score ?? 60;
  const gap = wvw.gapPoints;

  const days = [
    { label: "Mon", score: 78 },
    { label: "Tue", score: 72 },
    { label: "Wed", score: 70 },
    { label: "Thu", score: 62 },
    { label: "Fri", score: 58 },
    { label: "Sat", score: 85 },
    { label: "Sun", score: 88 },
  ];

  const barColor = (score: number) => {
    if (score >= 80) return "var(--color-emerald)";
    if (score >= 65) return "var(--color-accent-bright)";
    return "var(--color-coral)";
  };

  const levelLabel = (score: number) => {
    if (score >= 80) return "Best";
    if (score >= 65) return "OK";
    return "Watch";
  };

  return (
    <div className="card-vq p-5">
      <div className="font-mono-vq text-[10px] uppercase tracking-widest text-muted-vq mb-4">
        When do complaints happen?
      </div>
      <div className="space-y-2">
        {days.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <div className="text-xs text-muted-vq w-7 shrink-0">{d.label}</div>
            <div
              className="flex-1 h-2 rounded-full overflow-hidden"
              style={{ background: "var(--color-surface2)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${d.score}%`,
                  background: barColor(d.score),
                }}
              />
            </div>
            <div
              className="text-[11px] font-mono-vq w-10 text-right"
              style={{ color: barColor(d.score) }}
            >
              {levelLabel(d.score)}
            </div>
          </div>
        ))}
      </div>
      {wvw.keyFinding && (
        <div
          className="mt-4 text-xs text-muted-vq p-3 rounded-md leading-relaxed"
          style={{ background: "var(--color-surface2)" }}
        >
          💡 {wvw.keyFinding}
        </div>
      )}
    </div>
  );
}

function Footer({ report, slug }: { report: VenueIQReport; slug: string }) {
  return (
    <footer
      className="border-t border-accent-vq mt-10 px-6 py-5"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p className="text-[11px] text-muted-vq font-mono-vq">
          VenueIQ · {report.venue.name} · {report.meta.reportDate} · Brief
          summary
        </p>
        <Link
          to="/report/$slug"
          params={{ slug }}
          className="btn-ghost text-xs py-1.5 px-4 flex items-center gap-1.5"
        >
          View full detailed report <ArrowRight size={12} />
        </Link>
      </div>
    </footer>
  );
}

// ─── main export ─────────────────────────────────────────────────────────────

export function BriefReportShell({ report }: { report: VenueIQReport }) {
  // Grab the slug from the venue name for the "full report" link fallback
  const slug =
    report.venue.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-demo";

  return (
    <div className="min-h-screen bg-bg text-foreground">
      <ReportHeader report={report} />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        {/* Row 1: Grade + key numbers */}
        <GradeCard report={report} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <KeyNumbers report={report} />
          <WhatCustomersSay report={report} />
        </div>

        {/* Row 2: Action plan (most important to a busy owner) */}
        <ActionPlan report={report} />

        {/* Row 3: Breakdown cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ReportCard report={report} />
          <BadDayPattern report={report} />
        </div>

        {/* Row 4: Competitor snapshot (if data available) */}
        <CompetitorSnapshot report={report} />
      </main>

      <Footer report={report} slug={slug} />
    </div>
  );
}
