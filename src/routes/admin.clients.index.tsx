"use client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Share2 } from "lucide-react";
import { toast } from "sonner";
import { clientStore, type Client, type ClientStatus } from "@/lib/clientStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/clients/")({
  ssr: false,
  component: ClientsList,
});

const STATUSES: { v: "all" | ClientStatus; label: string }[] = [
  { v: "all", label: "All" },
  { v: "active", label: "Active" },
  { v: "pending", label: "Pending" },
  { v: "completed", label: "Completed" },
  { v: "on_hold", label: "On hold" },
];

function statusColor(s: ClientStatus) {
  return s === "active" ? "var(--color-emerald)" : s === "pending" ? "var(--color-accent)" : s === "completed" ? "var(--color-blue)" : "var(--color-muted)";
}

function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | ClientStatus>("all");

  useEffect(() => setClients(clientStore.list()), []);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (q && !`${c.venueName} ${c.city}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [clients, q, status]);

  const share = (slug: string) => {
    const url = `${window.location.origin}/report/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Report URL copied to clipboard");
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-4xl">Clients</h1>
          <p className="text-muted-vq text-sm">{clients.length} total · {filtered.length} shown</p>
        </div>
        <Link to="/admin/clients/new" className="btn-filled">
          <Plus size={14} /> New client
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-vq" />
          <input className="input-vq pl-9" placeholder="Search by venue or city…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.v}
              onClick={() => setStatus(s.v)}
              className={cn(
                "font-mono-vq text-[11px] uppercase tracking-wider px-3 py-2 rounded-md border transition",
                status === s.v ? "bg-accent-vq text-bg border-transparent" : "border-accent-vq text-muted-vq hover:text-foreground",
              )}
              style={status === s.v ? { background: "var(--color-accent)", color: "var(--color-bg)" } : undefined}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="card-vq card-vq-hover p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-display text-2xl truncate">{c.venueName}</h3>
                <p className="text-xs text-muted-vq truncate">{c.address}, {c.city}</p>
                <p className="text-xs text-muted-vq truncate">{c.venueType}</p>
              </div>
              <span className="badge-mono font-bold shrink-0" style={{ background: `${statusColor(c.status)}22`, color: statusColor(c.status) }}>
                {c.status}
              </span>
            </div>
            <div className="flex items-baseline gap-4">
              <div>
                <div className="font-mono-vq text-[9px] uppercase text-muted-vq">Rating</div>
                <div className="font-display text-2xl text-accent-bright">{c.overallRating ?? "—"}</div>
              </div>
              <div>
                <div className="font-mono-vq text-[9px] uppercase text-muted-vq">Health</div>
                <div className="font-display text-2xl text-accent-bright">{c.healthScore ?? "—"}</div>
              </div>
              <div>
                <div className="font-mono-vq text-[9px] uppercase text-muted-vq">Reports</div>
                <div className="font-display text-2xl">{c.reportsCount}</div>
              </div>
            </div>
            <div className="text-xs text-muted-vq">
              Next due: <span style={{ color: c.nextReportDue && new Date(c.nextReportDue) < new Date() ? "var(--color-coral)" : "var(--color-text)" }}>{c.nextReportDue ?? "—"}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Link to="/admin/clients/$id" params={{ id: c.id }} className="btn-ghost text-xs flex-1 py-2 px-3">View</Link>
              <Link to="/admin/clients/$id/edit" params={{ id: c.id }} className="btn-ghost text-xs py-2 px-3">Edit</Link>
              <button onClick={() => share(c.slug)} className="btn-ghost text-xs py-2 px-3" aria-label="Share">
                <Share2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full card-vq p-10 text-center text-muted-vq">No clients match your filters.</div>
        )}
      </div>
    </div>
  );
}
