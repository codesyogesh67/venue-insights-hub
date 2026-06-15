"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Activity,
  MessageSquareWarning,
  Users,
  Trophy,
  Sparkles,
  Target,
  Menu,
  X,
} from "lucide-react";
import type { VenueIQReport } from "@/lib/reportSchema";
import { GaugeRing } from "./shared/GaugeRing";
import { PdfExportButton } from "./shared/PdfExportButton";
import { OverviewPanel } from "./panels/OverviewPanel";
import { SentimentPanel } from "./panels/SentimentPanel";
import { ReviewsPanel } from "./panels/ReviewsPanel";
import { StaffPanel } from "./panels/StaffPanel";
import { CompetitorsPanel } from "./panels/CompetitorsPanel";
import { GapsPanel } from "./panels/GapsPanel";
import { ActionsPanel } from "./panels/ActionsPanel";
import { cn } from "@/lib/utils";

type PanelKey = "overview" | "sentiment" | "reviews" | "staff" | "competitors" | "gaps" | "actions";

const NAV: Array<{ group: string; items: Array<{ key: PanelKey; label: string; icon: React.ElementType; badgeKey?: "unanswered" | "fake" }> }> = [
  {
    group: "Analysis",
    items: [
      { key: "overview", label: "Overview", icon: LayoutDashboard },
      { key: "sentiment", label: "Sentiment", icon: Activity },
      { key: "reviews", label: "Reviews & Alerts", icon: MessageSquareWarning, badgeKey: "unanswered" },
      { key: "staff", label: "Staff", icon: Users },
    ],
  },
  {
    group: "Market",
    items: [
      { key: "competitors", label: "Competitors", icon: Trophy },
      { key: "gaps", label: "Market Gaps", icon: Sparkles },
    ],
  },
  { group: "Action", items: [{ key: "actions", label: "Action Plan", icon: Target }] },
];

export function ReportShell({
  report,
  embedded = false,
}: {
  report: VenueIQReport;
  embedded?: boolean;
}) {
  const [active, setActive] = useState<PanelKey>("overview");
  const [navOpen, setNavOpen] = useState(false);

  const renderPanel = () => {
    switch (active) {
      case "overview": return <OverviewPanel report={report} />;
      case "sentiment": return <SentimentPanel report={report} />;
      case "reviews": return <ReviewsPanel report={report} />;
      case "staff": return <StaffPanel report={report} />;
      case "competitors": return <CompetitorsPanel report={report} />;
      case "gaps": return <GapsPanel report={report} />;
      case "actions":
        return <ActionsPanel report={report} onJumpToEvidence={(p) => setActive(p as PanelKey)} />;
    }
  };

  const Sidebar = (
    <aside
      className={cn(
        "bg-surface border-r border-accent-vq scrollbar-thin-vq overflow-y-auto",
        "w-[260px] shrink-0",
        embedded ? "" : "lg:fixed lg:top-0 lg:bottom-0 lg:left-0",
      )}
    >
      <div className="p-5 space-y-6">
        <div>
          <div className="font-mono-vq text-[10px] uppercase tracking-widest text-muted-vq">
            Venue under analysis
          </div>
          <h2 className="font-display text-2xl text-foreground mt-1 leading-tight">
            {report.venue.name}
          </h2>
          <p className="text-xs text-muted-vq mt-1">
            {report.venue.address}, {report.venue.neighborhood}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <GaugeRing score={report.sidebar.healthScore} />
          <p className="text-xs text-center text-muted-vq leading-relaxed max-w-[200px]">
            {report.sidebar.healthScoreVerdict}
          </p>
        </div>

        <div className="space-y-2 text-xs">
          {[
            ["Google rating", report.sidebar.googleRating, "var(--color-accent)"],
            ["Reviews analysed", String(report.sidebar.totalReviewsAnalysed), "var(--color-text)"],
            ["Positive sentiment", `${report.sidebar.positiveSentimentPercent}%`, "var(--color-emerald)"],
            ["Need response", String(report.sidebar.reviewsNeedResponse), "var(--color-accent)"],
            ["Likely fake", String(report.sidebar.likelyFakeReviews), "var(--color-coral)"],
            ["Trend", report.sidebar.ratingTrendValue, "var(--color-emerald)"],
          ].map(([k, v, color]) => (
            <div key={k} className="flex justify-between items-baseline border-b border-accent-vq pb-1.5">
              <span className="text-muted-vq">{k}</span>
              <span className="font-mono-vq font-bold" style={{ color }}>{v}</span>
            </div>
          ))}
        </div>

        <nav className="space-y-4">
          {NAV.map((group) => (
            <div key={group.group}>
              <div className="font-mono-vq text-[9px] uppercase tracking-widest text-muted-vq mb-1.5 px-2">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((it) => {
                  const Icon = it.icon;
                  const isActive = active === it.key;
                  const badge =
                    it.badgeKey === "unanswered" ? report.sidebar.reviewsNeedResponse : undefined;
                  return (
                    <button
                      key={it.key}
                      onClick={() => {
                        setActive(it.key);
                        setNavOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-[rgba(201,151,58,0.18)] text-accent-bright"
                          : "text-foreground/80 hover:bg-surface2",
                      )}
                    >
                      <Icon size={15} />
                      <span className="flex-1 text-left">{it.label}</span>
                      {badge ? (
                        <span className="badge-mono" style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}>
                          {badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );

  return (
    <div className={cn("flex min-h-screen", !embedded && "bg-bg")}>
      <div className="hidden lg:block">{Sidebar}</div>
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            className="fixed inset-y-0 left-0 z-40 lg:hidden"
          >
            {Sidebar}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("flex-1 min-w-0", !embedded && "lg:ml-[260px]")}>
        <div
          id="venueiq-report-export"
          className="px-5 lg:px-10 py-6 space-y-6"
          style={{ background: "var(--color-bg)" }}
        >
          <header className="flex items-center justify-between gap-4 flex-wrap border-b border-accent-vq pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNavOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-surface2"
                aria-label="Open sidebar"
              >
                {navOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div>
                <div className="font-mono-vq text-[10px] uppercase tracking-widest text-muted-vq">
                  {report.venue.name}
                </div>
                <div className="text-xs text-muted-vq">{report.venue.address}, {report.venue.city}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge-mono" style={{ background: "var(--color-surface2)", color: "var(--color-accent)" }}>
                {report.meta.reportDate}
              </span>
              <PdfExportButton
                targetId="venueiq-report-export"
                fileName={`VenueIQ-${report.venue.name.replace(/\s+/g, "-")}-${report.meta.reportDate.replace(/\s+/g, "-")}.pdf`}
              />
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {renderPanel()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
