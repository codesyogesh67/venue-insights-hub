"use client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, FileText, Share2, Clock, ArrowRight } from "lucide-react";
import { clientStore, type Client } from "@/lib/clientStore";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  component: Dashboard,
});

function Stat({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <div className="card-vq p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono-vq text-[10px] uppercase tracking-widest text-muted-vq">{label}</div>
          <div className="font-display text-4xl mt-2 font-semibold" style={{ color }}>{value}</div>
        </div>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
  );
}

function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  useEffect(() => setClients(clientStore.list()), []);

  const reportsThisMonth = clients.filter((c) => {
    if (!c.updatedAt) return false;
    const d = new Date(c.updatedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const published = clients.filter((c) => c.isPublished).length;
  const due = clients.filter((c) => c.nextReportDue && new Date(c.nextReportDue) <= new Date(Date.now() + 7 * 86400000));
  const activity = clients.flatMap((c) =>
    c.activity.map((a) => ({ ...a, client: c }))
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      <div>
        <h1 className="font-display text-4xl">Dashboard</h1>
        <p className="text-muted-vq text-sm">An overview of your VenueIQ engagement.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total clients" value={clients.length} icon={Users} color="var(--color-accent)" />
        <Stat label="Reports this month" value={reportsThisMonth} icon={FileText} color="var(--color-accent-bright)" />
        <Stat label="Active share URLs" value={published} icon={Share2} color="var(--color-emerald)" />
        <Stat label="Due this week" value={due.length} icon={Clock} color="var(--color-coral)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="card-vq p-6 lg:col-span-2 space-y-3">
          <h2 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq">Recent activity</h2>
          {activity.length === 0 && <p className="text-muted-vq text-sm">No activity yet.</p>}
          {activity.map((a) => (
            <Link
              key={a.id}
              to="/admin/clients/$id"
              params={{ id: a.client.id }}
              className="flex items-center gap-3 p-3 rounded hover:bg-surface2 transition"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent-vq shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">
                  <span className="text-accent-vq">{a.client.venueName}</span> — {a.description}
                </div>
                <div className="text-xs text-muted-vq font-mono-vq">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
              <ArrowRight size={14} className="text-muted-vq" />
            </Link>
          ))}
        </section>

        <section className="card-vq p-6 space-y-3">
          <h2 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq">Due this week</h2>
          {due.length === 0 && <p className="text-muted-vq text-sm">All caught up.</p>}
          {due.map((c) => (
            <div key={c.id} className="p-3 rounded bg-surface2">
              <div className="font-medium">{c.venueName}</div>
              <div className="text-xs text-muted-vq mb-2">Due {c.nextReportDue}</div>
              <Link to="/admin/clients/$id" params={{ id: c.id }} className="btn-ghost text-xs py-1.5 px-3">
                Open
              </Link>
            </div>
          ))}
        </section>
      </div>

      <div className="flex gap-3">
        <Link to="/admin/clients/new" className="btn-filled">Add new client</Link>
        <Link to="/admin/clients" className="btn-ghost">View all clients</Link>
      </div>
    </div>
  );
}
