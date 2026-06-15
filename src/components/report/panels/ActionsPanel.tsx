"use client";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import type { VenueIQReport } from "@/lib/reportSchema";

export function ActionsPanel({
  report,
  onJumpToEvidence,
}: {
  report: VenueIQReport;
  onJumpToEvidence?: (panel: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-vq italic">
        {report.actions.actions.length} actions ranked by urgency and estimated impact — derived from all
        reviews and competitor analysis.
      </p>
      {report.actions.actions.map((a, i) => {
        const color =
          a.priority === "high" ? "var(--color-coral)" : a.priority === "medium" ? "var(--color-accent)" : "var(--color-emerald)";
        return (
          <motion.div
            key={a.actionId}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="card-vq card-vq-hover p-5 flex flex-col md:flex-row gap-5"
          >
            <div className="md:w-24 shrink-0">
              <span
                className="badge-mono font-bold inline-block"
                style={{ background: `${color}22`, color }}
              >
                {a.priority}
              </span>
            </div>
            <div className="flex-1 space-y-3">
              <h4 className="font-display text-2xl font-semibold">{a.title}</h4>
              <p className="text-foreground/85 leading-relaxed">{a.description}</p>
              <div className="flex items-center gap-2 text-sm text-emerald-vq">
                <TrendingUp size={14} />
                <span>{a.expectedImpact}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-vq font-mono-vq pt-1">
                <span>Cost: {a.estimatedCost}</span>
                <span>Time to result: {a.estimatedTimeToSeeResult}</span>
              </div>
              {onJumpToEvidence && (
                <button
                  onClick={() => onJumpToEvidence(a.evidencePanel)}
                  className="text-xs text-blue-vq hover:underline inline-flex items-center gap-1"
                >
                  See evidence <ArrowRight size={11} />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
