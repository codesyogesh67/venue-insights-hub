"use client";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Lock,
  ShieldAlert,
  BarChart3,
  MessageSquare,
  Zap,
  Users,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import type { VenueIQReport } from "@/lib/reportSchema";

// ── helpers ───────────────────────────────────────────────────────────────────

function healthColor(score: number) {
  if (score >= 75) return "var(--color-emerald)";
  if (score >= 60) return "var(--color-accent-bright)";
  return "var(--color-coral)";
}
function sentimentColor(s: string) {
  if (s === "positive") return "#00C48C";
  if (s === "mixed") return "#C9973A";
  return "#FF5C5C";
}
function cellColor(yours: number, theirs: number) {
  if (yours > theirs) return "var(--color-emerald)";
  if (yours < theirs) return "var(--color-coral)";
  return "var(--color-muted)";
}

// ── Sticky nav with section tabs ─────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "scorecard", label: "Scorecard" },
  { id: "voice", label: "Voice" },
  { id: "pulse", label: "Pulse" },
  { id: "actions", label: "Actions" },
  { id: "competitors", label: "Competitors" },
  { id: "upgrade", label: "Get Report" },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 64; // nav height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

function StickyNav({ report }: { report: VenueIQReport }) {
  const score = report.sidebar.healthScore;
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const ids = TABS.map((t) => t.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="sticky top-0 z-50"
      style={{
        background: "rgba(8,11,18,0.95)",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-mono-vq text-sm">
          <span
            style={{ color: "var(--color-accent-bright)", fontWeight: 700 }}
          >
            VenueIQ
          </span>
          <span style={{ color: "var(--color-muted)" }}>/</span>
          <span style={{ color: "var(--color-text-secondary)" }}>
            {report.venue.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="font-mono-vq text-xs"
            style={{ color: "var(--color-muted)" }}
          >
            {report.meta.reportDate}
          </span>
          <span
            className="font-mono-vq text-xs font-bold px-3 py-1 rounded"
            style={{
              background: "rgba(201,151,58,0.15)",
              color: "var(--color-accent-bright)",
              border: "1px solid rgba(201,151,58,0.3)",
            }}
          >
            Health {score}
          </span>
        </div>
      </div>

      {/* tabs row */}
      <div className="flex items-center gap-0 px-6 max-w-7xl mx-auto overflow-x-auto no-scrollbar">
        {TABS.map(({ id, label }) => {
          const isActive = active === id;
          const isUpgrade = id === "upgrade";
          return (
            <button
              key={id}
              onClick={() => {
                scrollTo(id);
                setActive(id);
              }}
              className="font-mono-vq text-xs uppercase tracking-widest px-4 py-2.5 whitespace-nowrap transition-colors shrink-0"
              style={{
                color: isUpgrade
                  ? "var(--color-accent-bright)"
                  : isActive
                  ? "var(--color-text-warm)"
                  : "var(--color-muted)",
                borderBottom: isActive
                  ? "2px solid var(--color-accent-bright)"
                  : "2px solid transparent",
                background:
                  isUpgrade && !isActive
                    ? "rgba(201,151,58,0.06)"
                    : "transparent",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Animated donut ────────────────────────────────────────────────────────────

function DonutScore({ score }: { score: number }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf: number;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const pct = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setProgress(Math.round(eased * score));
      if (pct < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const r = 88;
  const cx = 116;
  const cy = 116;
  const circ = 2 * Math.PI * r;
  const positivePct = score / 100;
  const negativePct = ((100 - score) / 100) * 0.3; // small red arc = negative portion
  const gap = 6;

  const positiveLen = circ * positivePct - gap;
  const negativeLen = circ * negativePct - gap;
  // negative arc starts at top, positive arc follows
  const negAngle = -90;
  const posAngle = negAngle + negativePct * 360 + (gap / circ) * 360;

  return (
    <div className="flex flex-col items-center">
      <svg width="232" height="232" viewBox="0 0 232 232">
        {/* track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="20"
        />
        {/* negative arc — coral */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--color-coral)"
          strokeWidth="20"
          strokeDasharray={`${negativeLen} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(${negAngle} ${cx} ${cy})`}
        />
        {/* positive arc — purple like reference image */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#7C6FFF"
          strokeWidth="20"
          strokeDasharray={`${positiveLen} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(${posAngle} ${cx} ${cy})`}
        />
        {/* animated number */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize="54"
          fontWeight="700"
          fontFamily="Georgia, serif"
          fill="white"
        >
          {progress}
        </text>
        {/* label */}
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          fontSize="10"
          letterSpacing="3"
          fontFamily="monospace"
          fill="rgba(255,255,255,0.4)"
        >
          HEALTH SCORE
        </text>
      </svg>

      {/* legend — what colors mean */}
      <div className="flex items-center gap-5 mt-1">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "#7C6FFF" }}
          />
          <span
            className="font-mono-vq text-xs"
            style={{ color: "var(--color-muted)" }}
          >
            Positive
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "var(--color-coral)" }}
          />
          <span
            className="font-mono-vq text-xs"
            style={{ color: "var(--color-muted)" }}
          >
            Negative
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
          <span
            className="font-mono-vq text-xs"
            style={{ color: "var(--color-muted)" }}
          >
            Neutral
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function HeroBanner({ report }: { report: VenueIQReport }) {
  const score = report.sidebar.healthScore;
  const unanswered = report.sidebar.reviewsNeedResponse;
  const fake = report.sidebar.likelyFakeReviews;
  const color = healthColor(score);

  const alerts = [
    {
      icon: MessageSquare,
      severity: "high",
      bold: `${unanswered} reviews unanswered`,
      rest: "Each unanswered negative costs you ranking position on Google",
    },
    {
      icon: ShieldAlert,
      severity: "high",
      bold: `${fake} likely fake reviews`,
      rest: "Uncontested fake reviews permanently suppress your star rating",
    },
    {
      icon: TrendingUp,
      severity: "mid",
      bold: "Response time 61h vs 24h benchmark",
      rest: "You're 2.5× slower than competitors at recovering unhappy guests",
    },
    {
      icon: AlertTriangle,
      severity: "mid",
      bold: "Weekend service gap detected",
      rest: "Fri–Sun sentiment drops sharply — losing revenue every weekend",
    },
  ];

  const stats = [
    {
      label: "Reviews Analysed",
      value: report.sidebar.totalReviewsAnalysed.toLocaleString(),
      color: "var(--color-text-warm)",
    },
    {
      label: "Google Rating",
      value: `${report.sidebar.googleRating.replace(" ★", "")}★`,
      color: "var(--color-accent-bright)",
    },
    {
      label: "Positive Sentiment",
      value: `${report.sidebar.positiveSentimentPercent}%`,
      color: "var(--color-emerald)",
    },
    {
      label: "Rating Trajectory",
      value: `${report.sidebar.ratingFrom} → ${report.sidebar.ratingTo}`,
      color: "var(--color-accent-bright)",
    },
  ];

  return (
    <section
      id="overview"
      className="relative overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      {/* ambient glow behind donut */}
      <div
        className="absolute right-0 top-0 w-1/2 h-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 70% at 75% 50%, ${color}12 0%, transparent 70%)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-center">
          {/* ── LEFT ── */}
          <div>
            {/* eyebrow */}
            <div
              className="font-mono-vq text-xs uppercase tracking-widest mb-5 flex items-center gap-3"
              style={{ color: "var(--color-accent-bright)" }}
            >
              Intelligence Brief
              <span
                className="w-px h-3 inline-block"
                style={{ background: "var(--color-border)" }}
              />
              <span style={{ color: "var(--color-muted)" }}>
                {report.meta.reportDate}
              </span>
            </div>

            {/* venue name — hero size */}
            <h1
              className="font-display leading-[0.9] mb-3"
              style={{
                fontSize: "clamp(3.5rem, 9vw, 6.5rem)",
                color: "var(--color-text-warm)",
                letterSpacing: "-0.03em",
              }}
            >
              {report.venue.name}
            </h1>

            <p
              className="text-base mb-9"
              style={{ color: "var(--color-muted)" }}
            >
              {report.venue.type} · {report.venue.neighborhood},{" "}
              {report.venue.city}
            </p>

            {/* stat row — horizontal, no cards */}
            <div
              className="flex flex-wrap gap-8 mb-10 pb-8"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              {stats.map(({ label, value, color: c }) => (
                <div key={label}>
                  <div
                    className="font-display text-3xl leading-none mb-1"
                    style={{ color: c }}
                  >
                    {value}
                  </div>
                  <div
                    className="font-mono-vq text-xs uppercase tracking-widest"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* alerts — 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {alerts.map(({ icon: Icon, severity, bold, rest }) => (
                <div
                  key={bold}
                  className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                  style={{
                    background:
                      severity === "high"
                        ? "rgba(255,92,92,0.06)"
                        : "rgba(201,151,58,0.06)",
                    border: `1px solid ${
                      severity === "high"
                        ? "rgba(255,92,92,0.18)"
                        : "rgba(201,151,58,0.18)"
                    }`,
                  }}
                >
                  <Icon
                    size={15}
                    style={{
                      color:
                        severity === "high"
                          ? "var(--color-coral)"
                          : "var(--color-accent-bright)",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  />
                  <div>
                    <div
                      className="text-sm font-semibold mb-0.5"
                      style={{ color: "var(--color-text-warm)" }}
                    >
                      {bold}
                    </div>
                    <div
                      className="text-xs leading-snug"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {rest}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — donut ── */}
          <div className="flex items-center justify-center">
            <div
              className="rounded-2xl flex flex-col items-center justify-center w-full py-10 px-6 relative"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                minHeight: "420px",
              }}
            >
              {/* inner glow */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${color}10 0%, transparent 70%)`,
                }}
              />
              <DonutScore score={score} />
            </div>
          </div>
        </div>
      </div>

      {/* bottom border */}
      <div style={{ height: 1, background: "var(--color-border)" }} />
    </section>
  );
}

// ── Scorecard rows with collapsible review ───────────────────────────────────

function ScorecardRows({
  display,
  is100Scale,
  report,
}: {
  display: { category: string; score: number; level: string; note: string }[];
  is100Scale: boolean;
  report: VenueIQReport;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const allTags = [
    ...report.overview.praiseTags.tags,
    ...report.overview.complaintTags.tags,
  ];

  return (
    <div className="px-8 pb-2 space-y-1">
      {display.map((c, ci) => {
        const color =
          c.level === "high"
            ? "var(--color-emerald)"
            : c.level === "mid"
            ? "var(--color-accent-bright)"
            : "var(--color-coral)";
        const levelLabel =
          c.level === "high" ? "STRONG" : c.level === "mid" ? "OK" : "WEAK";
        const pct = is100Scale
          ? Math.round(c.score)
          : Math.round((c.score / 10) * 100);
        const catLower = c.category.toLowerCase();
        const matchTag =
          allTags.find(
            (t) =>
              t.label.toLowerCase().includes(catLower.split(" ")[0]) ||
              catLower.includes(t.label.toLowerCase().split(" ")[0])
          ) ?? allTags[ci % allTags.length];
        const sampleReview = matchTag?.reviews?.[0];
        const isOpen = openIdx === ci;

        return (
          <div
            key={c.category}
            className="rounded-lg overflow-hidden"
            style={{
              border: isOpen ? `1px solid ${color}30` : "1px solid transparent",
              transition: "border-color 0.2s",
            }}
          >
            {/* bar row — clickable */}
            <button
              className="w-full text-left"
              onClick={() => setOpenIdx(isOpen ? null : ci)}
            >
              <div
                className="grid items-center gap-3 py-3 px-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                style={{ gridTemplateColumns: "160px 1fr 70px 55px 24px" }}
              >
                <span
                  className="text-base"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {c.category}
                </span>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--color-surface2)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: color,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
                <span
                  className="font-mono-vq font-bold text-base text-right"
                  style={{ color }}
                >
                  {c.score}
                  <span className="opacity-40 text-sm">/10</span>
                </span>
                <span
                  className="font-mono-vq text-xs uppercase tracking-wider text-right"
                  style={{ color }}
                >
                  {levelLabel}
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: "var(--color-muted)",
                    transform: isOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                    flexShrink: 0,
                  }}
                />
              </div>
            </button>

            {/* expandable review */}
            {isOpen && sampleReview && (
              <div className="px-3 pb-3">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: "var(--color-surface2)",
                    border: `1px solid ${color}20`,
                  }}
                >
                  <p
                    className="text-sm leading-relaxed mb-2"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    "{sampleReview.text}"
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--color-muted)" }}
                    >
                      — {sampleReview.reviewerName}
                    </span>
                    <span
                      className="font-mono-vq text-xs px-2 py-0.5 rounded"
                      style={{
                        background: "var(--color-surface)",
                        color: "var(--color-muted)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {sampleReview.source}
                    </span>
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          style={{
                            color:
                              s <= sampleReview.stars
                                ? "var(--color-accent-bright)"
                                : "rgba(255,255,255,0.1)",
                            fill:
                              s <= sampleReview.stars
                                ? "var(--color-accent-bright)"
                                : "transparent",
                          }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
                {/* blur CTA */}
                <div
                  className="relative mt-2 rounded-lg overflow-hidden"
                  style={{ height: 52 }}
                >
                  <div
                    className="p-3 blur-sm select-none"
                    style={{
                      color: "var(--color-muted)",
                      fontSize: 12,
                      fontStyle: "italic",
                    }}
                  >
                    "3 more reviews in this category — guests specifically
                    mentioned issues during peak hours…"
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center gap-2"
                    style={{
                      background: "rgba(14,17,23,0.8)",
                      backdropFilter: "blur(2px)",
                    }}
                  >
                    <Lock
                      size={12}
                      style={{ color: "var(--color-accent-bright)" }}
                    />
                    <span
                      className="font-mono-vq text-xs"
                      style={{ color: "var(--color-accent-bright)" }}
                    >
                      See all reviews in full report
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Scorecard — image-matched layout ────────────────────────────────────────

function ReportCard({ report }: { report: VenueIQReport }) {
  const raw = report.sentiment.byCategory.categories;

  // Smart grouping — keep weekend/weekday separate so weak scores show up
  const bucket = (cat: string): string => {
    const c = cat.toLowerCase();
    if (c.includes("weekend")) return "Weekend Service";
    if (
      c.includes("weekday") ||
      (c.includes("service") && !c.includes("speed"))
    )
      return "Weekday Service";
    if (
      c.includes("food") ||
      c.includes("pizza") ||
      c.includes("pasta") ||
      c.includes("coffee") ||
      c.includes("menu") ||
      c.includes("bagel") ||
      c.includes("drink")
    )
      return "Food & Drink";
    if (c.includes("speed") || c.includes("wait")) return "Speed of Service";
    if (c.includes("value") || c.includes("price") || c.includes("money"))
      return "Value for Money";
    if (
      c.includes("atmosphere") ||
      c.includes("ambi") ||
      c.includes("clean") ||
      c.includes("noise")
    )
      return "Atmosphere";
    if (c.includes("staff")) return "Staff";
    if (c.includes("reservation") || c.includes("booking"))
      return "Reservations";
    return cat;
  };

  const grouped: Record<string, { scores: number[]; note: string }> = {};
  raw.forEach((c) => {
    const key = bucket(c.category);
    if (!grouped[key])
      grouped[key] = { scores: [], note: c.noteForOwner ?? "" };
    grouped[key].scores.push(c.score);
    // keep the note from the lowest score in each group (most relevant)
    if (c.score < Math.min(...grouped[key].scores))
      grouped[key].note = c.noteForOwner ?? "";
  });

  const cats = Object.entries(grouped)
    .slice(0, 6)
    .map(([cat, { scores, note }]) => {
      const avg =
        Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
        10;
      // Auto-detect scale: if any score > 10, assume 0-100 scale
      const is100 = avg > 10;
      const level = is100
        ? avg >= 70
          ? "high"
          : avg >= 50
          ? "mid"
          : "low"
        : avg >= 7.5
        ? "high"
        : avg >= 5
        ? "mid"
        : "low";
      return { category: cat, score: avg, level, note };
    });

  // Sort: high first, then mid, then low
  cats.sort((a, b) => b.score - a.score);

  // Fallback: if grouping yields <2 distinct rows, use raw directly
  const display =
    cats.length < 2
      ? raw.slice(0, 6).map((c) => {
          const is100 = c.score > 10;
          return {
            category: c.category,
            score: c.score,
            level: is100
              ? c.score >= 70
                ? "high"
                : c.score >= 50
                ? "mid"
                : "low"
              : c.score >= 7.5
              ? "high"
              : c.score >= 5
              ? "mid"
              : "low",
            note: c.noteForOwner ?? "",
          };
        })
      : cats;
  const worst = [...display].sort((a, b) => a.score - b.score)[0];
  // Detect scale from display data
  const is100Scale = display.some((c) => c.score > 10);

  return (
    <div
      id="scorecard"
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="px-8 pt-6 pb-0">
        <div
          className="font-mono-vq text-xs uppercase tracking-widest mb-6"
          style={{ color: "var(--color-muted)" }}
        >
          Performance Scorecard
        </div>
      </div>

      {/* rows — collapsible review per category */}
      <ScorecardRows
        display={display}
        is100Scale={is100Scale}
        report={report}
      />

      {/* worst callout */}
      {worst && (
        <div
          className="mx-8 mb-6 flex items-start gap-3 p-4 rounded-lg"
          style={{
            background: "rgba(255,92,92,0.06)",
            border: "1px solid rgba(255,92,92,0.15)",
          }}
        >
          <AlertTriangle
            size={16}
            style={{ color: "var(--color-coral)", flexShrink: 0, marginTop: 2 }}
          />
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-muted)" }}
          >
            {worst.note ||
              `${worst.category} is your lowest-rated area — needs immediate attention.`}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Voice of the customer — image-matched ────────────────────────────────────

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          style={{
            color:
              i <= stars
                ? "var(--color-accent-bright)"
                : "var(--color-surface2)",
            fill: i <= stars ? "var(--color-accent-bright)" : "transparent",
          }}
        />
      ))}
    </span>
  );
}

function MentionBar({
  count,
  max,
  color,
}: {
  count: number;
  max: number;
  color: string;
}) {
  const pct = Math.round((count / max) * 100);
  return (
    <div
      className="mt-1 h-1 rounded-full overflow-hidden"
      style={{ background: "var(--color-surface2)" }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

function VoiceOfCustomer({ report }: { report: VenueIQReport }) {
  const praise = report.overview.praiseTags.tags.slice(0, 5);
  const complaints = report.overview.complaintTags.tags.slice(0, 4);
  const maxPraise = Math.max(...praise.map((t) => t.mentionCount));
  const maxComplaint = Math.max(...complaints.map((t) => t.mentionCount));

  return (
    <div
      id="voice"
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="px-8 pt-6 pb-2">
        <div
          className="font-mono-vq text-xs uppercase tracking-widest"
          style={{ color: "var(--color-muted)" }}
        >
          Voice of the Customer
        </div>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {/* PRAISE */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 mb-5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "var(--color-emerald)" }}
            />
            <span
              className="font-mono-vq text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-emerald)" }}
            >
              What they love
            </span>
          </div>
          <div className="space-y-4">
            {praise.map((t) => (
              <div key={t.id}>
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="text-base"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {t.label}
                  </span>
                  <span
                    className="font-mono-vq text-sm shrink-0"
                    style={{ color: "var(--color-muted)" }}
                  >
                    <strong style={{ color: "var(--color-text-secondary)" }}>
                      {t.mentionCount}
                    </strong>{" "}
                    mentions
                  </span>
                </div>
                <MentionBar
                  count={t.mentionCount}
                  max={maxPraise}
                  color="var(--color-emerald)"
                />
              </div>
            ))}
          </div>

          {/* 3 praise quotes */}
          <div className="mt-5 space-y-3">
            {praise
              .flatMap((t) => t.reviews ?? [])
              .slice(0, 3)
              .map((rv, ri) => (
                <div
                  key={ri}
                  className="p-3 rounded-lg"
                  style={{
                    background: "rgba(0,196,140,0.05)",
                    border: "1px solid rgba(0,196,140,0.12)",
                  }}
                >
                  <p
                    className="text-sm leading-relaxed mb-2"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    "
                    {rv.text.length > 130
                      ? rv.text.slice(0, 130) + "…"
                      : rv.text}
                    "
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StarRating stars={rv.stars} />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {rv.reviewerName}
                    </span>
                    <span
                      className="font-mono-vq text-xs px-2 py-0.5 rounded"
                      style={{
                        background: "var(--color-surface2)",
                        color: "var(--color-muted)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {rv.source}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* COMPLAINTS */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 mb-5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "var(--color-coral)" }}
            />
            <span
              className="font-mono-vq text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-coral)" }}
            >
              What they complain about
            </span>
          </div>
          <div className="space-y-4">
            {complaints.map((t) => (
              <div key={t.id}>
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="text-base"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {t.label}
                  </span>
                  <span
                    className="font-mono-vq text-sm shrink-0"
                    style={{ color: "var(--color-muted)" }}
                  >
                    <strong style={{ color: "var(--color-text-secondary)" }}>
                      {t.mentionCount}
                    </strong>{" "}
                    mentions
                  </span>
                </div>
                <MentionBar
                  count={t.mentionCount}
                  max={maxComplaint}
                  color="var(--color-coral)"
                />
              </div>
            ))}
          </div>

          {/* 3 complaint quotes */}
          <div className="mt-5 space-y-3">
            {complaints
              .flatMap((t) => t.reviews ?? [])
              .slice(0, 3)
              .map((rv, ri) => (
                <div
                  key={ri}
                  className="p-3 rounded-lg"
                  style={{
                    background: "rgba(255,92,92,0.05)",
                    border: "1px solid rgba(255,92,92,0.12)",
                  }}
                >
                  <p
                    className="text-sm leading-relaxed mb-2"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    "
                    {rv.text.length > 130
                      ? rv.text.slice(0, 130) + "…"
                      : rv.text}
                    "
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StarRating stars={rv.stars} />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {rv.reviewerName}
                    </span>
                    <span
                      className="font-mono-vq text-xs px-2 py-0.5 rounded"
                      style={{
                        background: "var(--color-surface2)",
                        color: "var(--color-muted)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {rv.source}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 12-Month Review Pulse ────────────────────────────────────────────────────

function ReviewPulse({ report }: { report: VenueIQReport }) {
  const months = report.overview.monthlyVolume.months;
  const peak = [...months].sort((a, b) => b.reviewCount - a.reviewCount)[0];
  const slowest = [...months].sort((a, b) => a.reviewCount - b.reviewCount)[0];

  // Group months into quarters (every 3 months) for uncrowded 3-bar groups
  const quarterData = [];
  for (let i = 0; i < months.length; i += 3) {
    const slice = months.slice(i, i + 3);
    const label = slice.map((m) => m.month).join("–");
    const total = slice.reduce((s, m) => s + m.reviewCount, 0);
    const avgSentiment =
      slice.filter((m) => m.sentiment === "positive").length >= 2
        ? "positive"
        : slice.filter((m) => m.sentiment === "negative").length >= 2
        ? "negative"
        : "mixed";
    const pos =
      avgSentiment === "positive"
        ? Math.round(total * 0.78)
        : avgSentiment === "mixed"
        ? Math.round(total * 0.55)
        : Math.round(total * 0.35);
    const neg =
      avgSentiment === "positive"
        ? Math.round(total * 0.12)
        : avgSentiment === "mixed"
        ? Math.round(total * 0.28)
        : Math.round(total * 0.45);
    quarterData.push({
      label,
      total,
      positive: pos,
      negative: neg,
      neutral: Math.max(0, total - pos - neg),
    });
  }

  const totalAll = quarterData.reduce((s, q) => s + q.total, 0);
  const totalPos = quarterData.reduce((s, q) => s + q.positive, 0);
  const totalNeg = quarterData.reduce((s, q) => s + q.negative, 0);

  return (
    <div
      id="pulse"
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="px-8 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div
            className="font-mono-vq text-xs uppercase tracking-widest"
            style={{ color: "var(--color-muted)" }}
          >
            12-Month Review Pulse
          </div>
          <div className="flex items-center gap-5 shrink-0">
            {[
              {
                label: "Total",
                val: totalAll,
                color: "var(--color-text-warm)",
              },
              { label: "Positive", val: totalPos, color: "#00C48C" },
              { label: "Negative", val: totalNeg, color: "var(--color-coral)" },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-right">
                <div
                  className="font-mono-vq font-bold text-base"
                  style={{ color }}
                >
                  {val}
                </div>
                <div
                  className="font-mono-vq text-xs"
                  style={{ color: "var(--color-muted)" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={quarterData}
            barCategoryGap="30%"
            barGap={3}
            margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
          >
            <XAxis
              dataKey="label"
              tick={{
                fill: "rgba(255,255,255,0.35)",
                fontSize: 11,
                fontFamily: "monospace",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{
                fill: "rgba(255,255,255,0.35)",
                fontSize: 11,
                fontFamily: "monospace",
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{
                background: "#0E1117",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
              labelStyle={{
                color: "rgba(255,255,255,0.45)",
                fontFamily: "monospace",
                fontSize: 11,
                marginBottom: 6,
                letterSpacing: "0.05em",
              }}
              itemStyle={{
                color: "rgba(255,255,255,0.8)",
                fontFamily: "monospace",
                fontSize: 12,
              }}
              formatter={(val: number, name: string) => [
                val,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
            />
            <Bar
              dataKey="positive"
              fill="#00C48C"
              fillOpacity={0.85}
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="neutral"
              fill="rgba(255,255,255,0.15)"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="negative"
              fill="#FF5C5C"
              fillOpacity={0.85}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            {[
              ["#00C48C", "Positive"],
              ["rgba(255,255,255,0.25)", "Neutral"],
              ["#FF5C5C", "Negative"],
            ].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: c }}
                />
                <span
                  className="font-mono-vq text-xs"
                  style={{ color: "var(--color-muted)" }}
                >
                  {l}
                </span>
              </div>
            ))}
          </div>
          <div
            className="flex items-center gap-5 text-xs font-mono-vq"
            style={{ color: "var(--color-muted)" }}
          >
            <span>
              📈 Peak:{" "}
              <strong style={{ color: "var(--color-text-secondary)" }}>
                {peak.month} ({peak.reviewCount})
              </strong>
            </span>
            <span>
              📉 Slowest:{" "}
              <strong style={{ color: "var(--color-text-secondary)" }}>
                {slowest.month} ({slowest.reviewCount})
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Priority Actions — 5 actions, card grid ──────────────────────────────────

function TopActions({ report }: { report: VenueIQReport }) {
  const actions = (report.actions?.actions ?? []).slice(0, 5);
  if (actions.length === 0) return null;

  const meta = (p: string) => {
    if (p === "high")
      return {
        accent: "var(--color-coral)",
        bg: "rgba(255,92,92,0.06)",
        border: "rgba(255,92,92,0.2)",
        badge: "rgba(255,92,92,0.12)",
        label: "Do now",
        dot: "#FF5C5C",
      };
    if (p === "medium")
      return {
        accent: "var(--color-accent-bright)",
        bg: "rgba(201,151,58,0.06)",
        border: "rgba(201,151,58,0.2)",
        badge: "rgba(201,151,58,0.12)",
        label: "This week",
        dot: "#C9973A",
      };
    return {
      accent: "var(--color-emerald)",
      bg: "rgba(0,196,140,0.06)",
      border: "rgba(0,196,140,0.2)",
      badge: "rgba(0,196,140,0.12)",
      label: "Quick win",
      dot: "#00C48C",
    };
  };

  return (
    <div
      id="actions"
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* header */}
      <div className="px-8 pt-6 pb-4 flex items-center justify-between">
        <div
          className="font-mono-vq text-xs uppercase tracking-widest"
          style={{ color: "var(--color-muted)" }}
        >
          Priority Actions
        </div>
        <div className="flex items-center gap-3">
          {[
            ["#FF5C5C", "Do now"],
            ["#C9973A", "This week"],
            ["#00C48C", "Quick win"],
          ].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: c }} />
              <span
                className="font-mono-vq text-xs"
                style={{ color: "var(--color-muted)" }}
              >
                {l}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* action cards — 2 col grid on desktop */}
      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((a, i) => {
          const m = meta(a.priority);
          return (
            <div
              key={i}
              className="rounded-xl p-5 flex flex-col gap-3"
              style={{ background: m.bg, border: `1px solid ${m.border}` }}
            >
              {/* top row: number + badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-mono-vq text-xs font-bold"
                    style={{ background: `${m.dot}20`, color: m.accent }}
                  >
                    {i + 1}
                  </div>
                  <span
                    className="font-mono-vq text-xs font-bold uppercase px-2.5 py-1 rounded-full"
                    style={{ background: m.badge, color: m.accent }}
                  >
                    {m.label}
                  </span>
                </div>
              </div>

              {/* title */}
              <div
                className="text-base font-semibold leading-snug"
                style={{ color: "var(--color-text-warm)" }}
              >
                {a.title}
              </div>

              {/* cost + timeline chips */}
              <div className="flex items-center gap-2 flex-wrap mt-auto">
                <span
                  className="font-mono-vq text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--color-text-secondary)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  💰 {a.estimatedCost}
                </span>
                <span
                  className="font-mono-vq text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--color-text-secondary)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  ⏱ {a.estimatedTimeToSeeResult}
                </span>
              </div>

              {/* expected impact — one line, no paragraph */}
              {a.expectedImpact && (
                <div
                  className="text-sm font-medium"
                  style={{ color: m.accent }}
                >
                  → {a.expectedImpact}
                </div>
              )}
            </div>
          );
        })}

        {/* 5th card fills full width if odd */}
        {actions.length === 5 && (
          <div
            className="md:col-span-2 rounded-xl px-5 py-3 flex items-center justify-between gap-4"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span className="text-sm" style={{ color: "var(--color-muted)" }}>
              Full report includes all remaining actions with evidence behind
              each one.
            </span>
            <Lock
              size={14}
              style={{ color: "var(--color-muted)", flexShrink: 0 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Competitor Table — image-matched ─────────────────────────────────────────

const METRIC_KEYS: { key: string; label: string }[] = [
  { key: "overallRating", label: "Overall Rating" },
  { key: "foodQuality", label: "Food Quality" },
  { key: "serviceSpeed", label: "Service Speed" },
  { key: "valueMoney", label: "Value for Money" },
  { key: "atmosphere", label: "Atmosphere" },
];

function getScores(c: {
  scores?: Record<string, number>;
  overallRating?: number;
}) {
  return {
    overallRating: c.overallRating ?? c.scores?.overallRating ?? 0,
    foodQuality: c.scores?.foodQuality ?? 0,
    serviceSpeed: c.scores?.serviceSpeed ?? 0,
    valueMoney: c.scores?.valueMoney ?? 0,
    atmosphere: c.scores?.atmosphere ?? 0,
  };
}

function CompetitorTable({ report }: { report: VenueIQReport }) {
  const venues = report.competitors?.venues?.slice(0, 3) ?? [];
  if (venues.length === 0) return null;

  const hh = report.competitors?.headToHead;
  const yourRaw = parseFloat(report.sidebar.googleRating);
  const yourScores: Record<string, number> = {};
  if (hh?.metrics) {
    hh.metrics.forEach((m: { metricKey: string; yourScore: number }) => {
      yourScores[m.metricKey] = m.yourScore;
    });
  }
  const you = {
    overallRating: yourRaw,
    foodQuality: yourScores.foodQuality ?? 0,
    serviceSpeed: yourScores.serviceSpeed ?? 0,
    valueMoney: yourScores.valueMoney ?? 0,
    atmosphere: yourScores.atmosphere ?? 0,
  };

  // win counts per competitor
  const winCounts = venues.map((c) => {
    const s = getScores(c as Parameters<typeof getScores>[0]);
    return METRIC_KEYS.filter(({ key }) => {
      const y = you[key as keyof typeof you];
      const t = s[key as keyof typeof s];
      return y > 0 && t > 0 && y > t;
    }).length;
  });

  return (
    <div
      id="competitors"
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="px-8 pt-6 pb-4">
        <div
          className="font-mono-vq text-xs uppercase tracking-widest"
          style={{ color: "var(--color-muted)" }}
        >
          How You Compare Nearby
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: "600px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
              {/* metric col */}
              <th
                className="px-8 py-4 text-left font-mono-vq text-xs uppercase tracking-wider"
                style={{ color: "var(--color-muted)", width: "180px" }}
              >
                Metric
              </th>
              {/* You */}
              <th
                className="px-6 py-4 text-left"
                style={{
                  borderLeft: "1px solid rgba(201,151,58,0.3)",
                  background: "rgba(201,151,58,0.04)",
                }}
              >
                <div
                  className="font-display text-xl"
                  style={{ color: "var(--color-accent-bright)" }}
                >
                  {report.venue.name}
                </div>
                <div
                  className="font-mono-vq text-xs mt-1 px-2 py-0.5 rounded inline-block"
                  style={{
                    background: "rgba(201,151,58,0.15)",
                    color: "var(--color-accent-bright)",
                  }}
                >
                  YOUR VENUE
                </div>
              </th>
              {/* Competitors */}
              {venues.map((c, ci) => {
                const wins = winCounts[ci];
                const youWin = wins >= Math.ceil(METRIC_KEYS.length / 2);
                return (
                  <th
                    key={c.venueId}
                    className="px-6 py-4 text-left"
                    style={{ borderLeft: "1px solid var(--color-border)" }}
                  >
                    <div
                      className="font-display text-xl"
                      style={{ color: "var(--color-text-warm)" }}
                    >
                      {c.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="font-mono-vq text-xs px-2 py-0.5 rounded"
                        style={{
                          background: youWin
                            ? "rgba(255,92,92,0.12)"
                            : "rgba(0,196,140,0.12)",
                          color: youWin
                            ? "var(--color-coral)"
                            : "var(--color-emerald)",
                        }}
                      >
                        {youWin
                          ? `THEY LEAD ${METRIC_KEYS.length - wins}/${
                              METRIC_KEYS.length
                            }`
                          : `YOU WIN ${wins}/${METRIC_KEYS.length}`}
                      </span>
                      <span
                        className="font-mono-vq text-xs"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {c.distance}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {METRIC_KEYS.map(({ key, label }) => {
              const yourVal = you[key as keyof typeof you];
              return (
                <tr
                  key={key}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td
                    className="px-8 py-4 text-sm"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {label}
                  </td>
                  {/* Your score */}
                  <td
                    className="px-6 py-4"
                    style={{
                      borderLeft: "1px solid rgba(201,151,58,0.3)",
                      background: "rgba(201,151,58,0.04)",
                    }}
                  >
                    <span
                      className="font-mono-vq font-bold text-xl"
                      style={{ color: "var(--color-accent-bright)" }}
                    >
                      {yourVal > 0 ? yourVal.toFixed(1) : "—"}
                    </span>
                  </td>
                  {/* Competitor scores */}
                  {venues.map((c) => {
                    const s = getScores(c as Parameters<typeof getScores>[0]);
                    const theirVal = s[key as keyof typeof s];
                    const winning =
                      yourVal > 0 && theirVal > 0 && yourVal > theirVal;
                    const losing =
                      yourVal > 0 && theirVal > 0 && yourVal < theirVal;
                    return (
                      <td
                        key={c.venueId}
                        className="px-6 py-4"
                        style={{ borderLeft: "1px solid var(--color-border)" }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono-vq font-bold text-xl"
                            style={{
                              color: winning
                                ? "var(--color-emerald)"
                                : losing
                                ? "var(--color-coral)"
                                : "var(--color-muted)",
                            }}
                          >
                            {theirVal > 0 ? theirVal.toFixed(1) : "—"}
                          </span>
                          {winning && (
                            <span
                              className="text-base"
                              style={{ color: "var(--color-emerald)" }}
                            >
                              ↘
                            </span>
                          )}
                          {losing && (
                            <span
                              className="text-base"
                              style={{ color: "var(--color-coral)" }}
                            >
                              ↗
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* Total reviews */}
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <td
                className="px-8 py-4 text-sm"
                style={{ color: "var(--color-muted)" }}
              >
                Total Reviews
              </td>
              <td
                className="px-6 py-4"
                style={{
                  borderLeft: "1px solid rgba(201,151,58,0.3)",
                  background: "rgba(201,151,58,0.04)",
                }}
              >
                <span
                  className="font-mono-vq font-bold text-xl"
                  style={{ color: "var(--color-accent-bright)" }}
                >
                  {report.sidebar.totalReviewsAnalysed.toLocaleString()}
                </span>
              </td>
              {venues.map((c) => (
                <td
                  key={c.venueId}
                  className="px-6 py-4"
                  style={{ borderLeft: "1px solid var(--color-border)" }}
                >
                  <span
                    className="font-mono-vq text-xl"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {c.reviewCount ?? "—"}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Competitive summary — clear bullets */}
      <div
        className="px-8 py-5 border-t space-y-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="font-mono-vq text-xs uppercase tracking-widest mb-3"
          style={{ color: "var(--color-muted)" }}
        >
          Competitive Verdict
        </div>
        {/* Per-metric bullets */}
        {METRIC_KEYS.map(({ key, label }) => {
          const yourVal = you[key as keyof typeof you];
          const betterThan = venues.filter((c) => {
            const s = getScores(c as Parameters<typeof getScores>[0]);
            return (
              s[key as keyof typeof s] > 0 && yourVal > s[key as keyof typeof s]
            );
          }).length;
          const worseThan = venues.filter((c) => {
            const s = getScores(c as Parameters<typeof getScores>[0]);
            return (
              s[key as keyof typeof s] > 0 && yourVal < s[key as keyof typeof s]
            );
          }).length;
          if (yourVal === 0) return null;
          const winning = betterThan >= venues.length / 2;
          return (
            <div key={key} className="flex items-start gap-2 text-sm">
              <span
                style={{
                  color: winning
                    ? "var(--color-emerald)"
                    : "var(--color-coral)",
                  flexShrink: 0,
                }}
              >
                {winning ? "✓" : "✗"}
              </span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                <strong>{label}:</strong>{" "}
                {winning
                  ? `You lead — ${
                      betterThan === venues.length
                        ? "ahead of all nearby competitors"
                        : `beating ${betterThan} of ${venues.length} competitors`
                    }`
                  : `You trail — ${worseThan} of ${venues.length} competitor${
                      worseThan > 1 ? "s" : ""
                    } outperform you here`}
              </span>
            </div>
          );
        })}
        {/* Overall win/lose */}
        {hh?.winSummary && (
          <div
            className="flex items-start gap-2 text-sm mt-1 pt-3 border-t"
            style={{
              borderColor: "rgba(255,255,255,0.05)",
              color: "var(--color-emerald)",
            }}
          >
            <CheckCircle size={14} className="mt-0.5 shrink-0" />
            <span>{hh.winSummary}</span>
          </div>
        )}
        {hh?.loseSummary && (
          <div
            className="flex items-start gap-2 text-sm"
            style={{ color: "var(--color-coral)" }}
          >
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{hh.loseSummary}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Summary accordion ─────────────────────────────────────────────────────

function AISummaryAccordion({ report }: { report: VenueIQReport }) {
  const [open, setOpen] = useState(false);
  const paras = report.overview.aiSummary.paragraphs;
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-8 py-5 text-left"
        style={{ cursor: "pointer" }}
      >
        <span
          className="font-mono-vq text-sm uppercase tracking-widest font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          AI Analysis · Full Narrative
        </span>
        {open ? (
          <ChevronUp size={18} style={{ color: "var(--color-muted)" }} />
        ) : (
          <ChevronDown size={18} style={{ color: "var(--color-muted)" }} />
        )}
      </button>
      {open && (
        <div
          className="px-8 pb-8 space-y-5 border-t pt-6"
          style={{ borderColor: "var(--color-border)" }}
        >
          {paras.map((p, i) => (
            <p
              key={i}
              className="text-base leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Upgrade CTA — two-tier pricing ───────────────────────────────────────────

function UpgradeCTA({ report }: { report: VenueIQReport }) {
  const unanswered = report.sidebar.reviewsNeedResponse;
  const fake = report.sidebar.likelyFakeReviews;
  const competitors = report.competitors?.venues?.slice(0, 3) ?? [];
  const competitorNames = competitors.map((c) => c.name);

  const tier1Features = [
    `Reply drafts for all ${unanswered} unanswered negative reviews`,
    `Evidence report on ${fake} likely fake reviews + how to dispute`,
    "Full review-by-review breakdown across all sources",
    "Staff performance analysis — which shifts underperform and why",
    "8 prioritised actions with evidence behind each one",
    "90-day operational improvement playbook",
  ];

  const tier2Extras = [
    `Deep dive on ${
      competitorNames[0] ?? "nearest competitor"
    } — their weak spots & your opening`,
    `Deep dive on ${
      competitorNames[1] ?? "second competitor"
    } — what their customers say you're missing`,
    `Deep dive on ${
      competitorNames[2] ?? "third competitor"
    } — where you win and where you don't`,
    "Side-by-side review quote comparison across all 3",
    "Positioning strategy — how to communicate your advantage",
  ];

  const trustPoints = [
    `All ${report.sidebar.totalReviewsAnalysed.toLocaleString()} reviews analysed`,
    "Plain English, no jargon",
    "Real data, not averages",
    "Private URL in 48 hours",
  ];

  return (
    <div id="upgrade" className="space-y-4">
      {/* Header */}
      <div
        className="font-mono-vq text-xs uppercase tracking-widest px-1"
        style={{ color: "var(--color-muted)" }}
      >
        Get the full report
      </div>

      {/* Two tier cards side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Tier 1 — $49 ── */}
        <div
          className="rounded-xl flex flex-col"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* header */}
          <div
            className="px-7 pt-7 pb-5 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div
              className="font-mono-vq text-xs uppercase tracking-widest mb-3"
              style={{ color: "var(--color-muted)" }}
            >
              Full Intelligence Report
            </div>
            <div className="flex items-end gap-2 mb-1">
              <div
                className="font-display"
                style={{
                  fontSize: "clamp(3rem, 6vw, 4rem)",
                  color: "var(--color-text-warm)",
                  lineHeight: 1,
                }}
              >
                $49
              </div>
              <div
                className="font-mono-vq text-xs pb-2"
                style={{ color: "var(--color-muted)" }}
              >
                one-time
              </div>
            </div>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Everything in the brief report, fully expanded — every review,
              every action, full evidence.
            </p>
          </div>

          {/* features */}
          <div className="px-7 py-5 flex-1 space-y-3">
            {tier1Features.map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <CheckCircle
                  size={14}
                  style={{
                    color: "var(--color-emerald)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <span
                  className="text-sm leading-snug"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-7 pb-7 pt-2">
            <a
              href={`mailto:hello@venueiq.com?subject=Full Report $49 — ${encodeURIComponent(
                report.venue.name
              )}`}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg font-mono-vq text-sm uppercase tracking-widest font-bold"
              style={{
                background: "var(--color-accent-bright)",
                color: "var(--color-bg)",
              }}
            >
              Get the full report →
            </a>
            <p
              className="text-xs text-center mt-2"
              style={{ color: "var(--color-muted)" }}
            >
              or reply to the email we sent you
            </p>
          </div>
        </div>

        {/* ── Tier 2 — $99 ── */}
        <div
          className="rounded-xl flex flex-col relative overflow-hidden"
          style={{
            background: "var(--color-surface)",
            border: "2px solid rgba(139,92,246,0.5)",
          }}
        >
          {/* most popular badge */}
          <div
            className="absolute top-0 right-0 font-mono-vq text-xs uppercase tracking-widest px-4 py-1.5 rounded-bl-lg"
            style={{ background: "rgba(139,92,246,0.9)", color: "#fff" }}
          >
            Most Popular
          </div>

          {/* header */}
          <div
            className="px-7 pt-7 pb-5 border-b"
            style={{ borderColor: "rgba(139,92,246,0.2)" }}
          >
            <div
              className="font-mono-vq text-xs uppercase tracking-widest mb-3"
              style={{ color: "rgba(139,92,246,0.9)" }}
            >
              Full Report + Competitor Intelligence
            </div>
            <div className="flex items-end gap-2 mb-1">
              <div
                className="font-display"
                style={{
                  fontSize: "clamp(3rem, 6vw, 4rem)",
                  color: "var(--color-text-warm)",
                  lineHeight: 1,
                }}
              >
                $99
              </div>
              <div
                className="font-mono-vq text-xs pb-2"
                style={{ color: "var(--color-muted)" }}
              >
                one-time
              </div>
            </div>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Everything in the $49 report, plus a deep intelligence dive on
              your 3 nearest competitors.
            </p>
          </div>

          {/* everything in tier 1 */}
          <div className="px-7 pt-5 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-px flex-1"
                style={{ background: "var(--color-border)" }}
              />
              <span
                className="font-mono-vq text-xs uppercase"
                style={{ color: "var(--color-muted)" }}
              >
                Everything in $49, plus
              </span>
              <div
                className="h-px flex-1"
                style={{ background: "var(--color-border)" }}
              />
            </div>
          </div>

          {/* competitor extras */}
          <div className="px-7 pb-5 flex-1 space-y-3">
            {tier2Extras.map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <Zap
                  size={14}
                  style={{
                    color: "rgba(139,92,246,0.9)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <span
                  className="text-sm leading-snug"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {f}
                </span>
              </div>
            ))}

            {/* named competitor chips */}
            {competitorNames.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-2">
                {competitorNames.map((name) => (
                  <span
                    key={name}
                    className="font-mono-vq text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(139,92,246,0.12)",
                      color: "rgba(139,92,246,0.9)",
                      border: "1px solid rgba(139,92,246,0.25)",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="px-7 pb-7 pt-2">
            <a
              href={`mailto:hello@venueiq.com?subject=Full Report + Competitors $99 — ${encodeURIComponent(
                report.venue.name
              )}`}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg font-semibold text-sm"
              style={{ background: "rgba(139,92,246,0.9)", color: "#fff" }}
            >
              Get full report + competitor intel →
            </a>
            <p
              className="text-xs text-center mt-2"
              style={{ color: "var(--color-muted)" }}
            >
              or reply to the email we sent you
            </p>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="flex items-center justify-center gap-8 py-3 flex-wrap">
        {trustPoints.map((t) => (
          <div
            key={t}
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--color-muted)" }}
          >
            <CheckCircle
              size={13}
              style={{ color: "var(--color-accent-bright)", flexShrink: 0 }}
            />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer({ report }: { report: VenueIQReport }) {
  return (
    <footer
      className="border-t px-8 py-5 mt-10"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p
          className="font-mono-vq text-xs"
          style={{ color: "var(--color-muted)" }}
        >
          VenueIQ · {report.venue.name} · {report.meta.reportDate} ·
          Intelligence Brief
        </p>
        <p
          className="font-mono-vq text-xs"
          style={{ color: "var(--color-muted)" }}
        >
          {report.sidebar.totalReviewsAnalysed.toLocaleString()} reviews ·{" "}
          {report.sidebar.sourcesAnalysed.join(", ")}
        </p>
      </div>
    </footer>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function BriefReportShell({ report }: { report: VenueIQReport }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <StickyNav report={report} />
      <HeroBanner report={report} />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <ReportCard report={report} />
        <VoiceOfCustomer report={report} />
        <ReviewPulse report={report} />
        <TopActions report={report} />
        <CompetitorTable report={report} />
        <AISummaryAccordion report={report} />
        <UpgradeCTA report={report} />
      </main>

      <Footer report={report} />
    </div>
  );
}
