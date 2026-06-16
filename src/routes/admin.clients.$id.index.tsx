"use client";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Share2, Edit, ArrowLeft, FileText } from "lucide-react";
import { clientStore, type Client } from "@/lib/clientStore";
import { ReportShell } from "@/components/report/ReportShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/clients/$id/")({
  ssr: false,
  component: ClientDetail,
});

type Tab = "overview" | "report" | "notes" | "activity";

function ClientDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [noteText, setNoteText] = useState("");

  const refresh = () => {
    const c = clientStore.get(id);
    if (!c) navigate({ to: "/admin/clients" });
    else setClient(c);
  };
  useEffect(refresh, [id, navigate]);

  if (!client) return <div className="p-8 text-muted-vq">Loading…</div>;

  const share = () => {
    const url = `${window.location.origin}/report/${client.slug}`;
    navigator.clipboard.writeText(url);
    clientStore.logActivity(client.id, "link_shared", "Report URL shared");
    toast.success("Report URL copied to clipboard");
    refresh();
  };

  const shareBrief = () => {
    const url = `${window.location.origin}/brief/${client.slug}`;
    navigator.clipboard.writeText(url);
    clientStore.logActivity(client.id, "link_shared", "Brief report URL shared");
    toast.success("Brief report URL copied to clipboard");
    refresh();
  };

  const saveNote = () => {
    if (!noteText.trim()) return;
    clientStore.addNote(client.id, noteText.trim());
    setNoteText("");
    toast.success("Note saved");
    refresh();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      <Link
        to="/admin/clients"
        className="text-xs text-muted-vq hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft size={12} /> Back to clients
      </Link>
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl">{client.venueName}</h1>
          <p className="text-muted-vq text-sm">
            {client.address}, {client.city} · {client.venueType}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            to="/admin/clients/$id/edit"
            params={{ id: client.id }}
            className="btn-ghost text-sm"
          >
            <Edit size={13} /> Edit JSON
          </Link>
          <button onClick={share} className="btn-ghost text-sm">
            <Share2 size={13} /> Share full link
          </button>
          <button onClick={shareBrief} className="btn-ghost text-sm">
            <Share2 size={13} /> Share brief link
          </button>
          {/* Brief (owner-friendly) report — opens in new tab */}
          <Link
            to="/brief/$slug"
            params={{ slug: client.slug }}
            target="_blank"
            className="btn-ghost text-sm"
          >
            <FileText size={13} /> Brief report
          </Link>
          {/* Full detailed report — opens in new tab */}
          <Link
            to="/report/$slug"
            params={{ slug: client.slug }}
            target="_blank"
            className="btn-filled text-sm"
          >
            Full report
          </Link>
        </div>
      </header>

      <nav className="flex gap-1 border-b border-accent-vq">
        {(["overview", "report", "notes", "activity"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm border-b-2 -mb-px transition capitalize",
              tab === t
                ? "border-accent-vq text-accent-bright"
                : "border-transparent text-muted-vq hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ["Health score", client.healthScore ?? "—", "var(--color-accent-bright)"],
            ["Overall rating", client.overallRating ?? "—", "var(--color-accent)"],
            ["Reports generated", client.reportsCount, "var(--color-emerald)"],
            ["Status", client.status, "var(--color-blue)"],
          ].map(([k, v, c]) => (
            <div key={k as string} className="card-vq p-5">
              <div className="font-mono-vq text-[10px] uppercase text-muted-vq">
                {k as string}
              </div>
              <div
                className="font-display text-4xl mt-2 font-semibold"
                style={{ color: c as string }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "report" && client.reportJson && (
        <div className="-mx-8">
          <ReportShell report={client.reportJson} embedded />
        </div>
      )}
      {tab === "report" && !client.reportJson && (
        <div className="card-vq p-10 text-center text-muted-vq">
          No report JSON for this client yet.
        </div>
      )}

      {tab === "notes" && (
        <div className="space-y-4 max-w-3xl">
          <div className="card-vq p-5 space-y-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note — context, decisions, follow-ups…"
              className="input-vq min-h-[100px]"
            />
            <button onClick={saveNote} className="btn-filled">
              Save note
            </button>
          </div>
          {client.notes.map((n) => (
            <div key={n.id} className="card-vq p-4">
              <div className="font-mono-vq text-[10px] text-muted-vq uppercase">
                {new Date(n.createdAt).toLocaleString()} · {n.adminEmail}
              </div>
              <p className="text-sm mt-1.5 leading-relaxed">{n.noteText}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "activity" && (
        <div className="space-y-2 max-w-3xl">
          {client.activity.map((a) => (
            <div key={a.id} className="card-vq p-3 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-vq shrink-0" />
              <div className="flex-1">
                <div className="text-sm">{a.description}</div>
                <div className="text-xs text-muted-vq font-mono-vq">
                  {new Date(a.createdAt).toLocaleString()} · {a.adminEmail}
                </div>
              </div>
              <span
                className="badge-mono text-muted-vq"
                style={{ background: "var(--color-surface2)" }}
              >
                {a.actionType}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
