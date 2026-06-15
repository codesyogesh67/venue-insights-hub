"use client";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, AlertTriangle, ArrowLeft } from "lucide-react";
import { clientStore, type Client } from "@/lib/clientStore";
import { validateReportShape } from "@/lib/reportSchema";

export const Route = createFileRoute("/admin/clients/$id/edit")({
  ssr: false,
  component: EditClient,
});

function EditClient() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [json, setJson] = useState("");
  const [validation, setValidation] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    const c = clientStore.get(id);
    if (!c) {
      navigate({ to: "/admin/clients" });
      return;
    }
    setClient(c);
    setJson(c.reportJson ? JSON.stringify(c.reportJson, null, 2) : "");
  }, [id, navigate]);

  if (!client) return <div className="p-8 text-muted-vq">Loading…</div>;

  const validate = () => {
    try {
      const parsed = JSON.parse(json);
      validateReportShape(parsed);
      setValidation({ ok: true, msg: "Valid JSON — all sections found" });
      return parsed;
    } catch (e) {
      setValidation({ ok: false, msg: e instanceof Error ? e.message : "Invalid JSON" });
      return null;
    }
  };

  const save = () => {
    const parsed = validate();
    if (!parsed) return;
    clientStore.update(client.id, { reportJson: parsed, reportsCount: client.reportsCount + 1 });
    clientStore.logActivity(client.id, "json_updated", "Report JSON updated");
    toast.success("Changes saved");
    navigate({ to: "/admin/clients/$id", params: { id: client.id } });
  };

  return (
    <div className="p-8 max-w-5xl space-y-4">
      <Link to="/admin/clients/$id" params={{ id: client.id }} className="text-xs text-muted-vq hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft size={12} /> Back to {client.venueName}
      </Link>
      <h1 className="font-display text-4xl">Edit report</h1>
      <div className="card-vq p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq">Report JSON</h2>
          <button onClick={validate} className="btn-ghost text-xs py-1.5 px-3">Validate</button>
        </div>
        <textarea
          value={json}
          onChange={(e) => { setJson(e.target.value); setValidation(null); }}
          spellCheck={false}
          className="input-vq min-h-[500px] font-mono-vq text-xs leading-relaxed"
          style={{
            caretColor: "var(--color-accent-bright)",
            borderColor: validation ? (validation.ok ? "var(--color-emerald)" : "var(--color-coral)") : undefined,
          }}
        />
        {validation && (
          <div
            className="text-sm flex items-start gap-2 p-3 rounded"
            style={{
              background: validation.ok ? "rgba(0,196,140,0.1)" : "rgba(255,92,92,0.1)",
              color: validation.ok ? "var(--color-emerald)" : "var(--color-coral)",
            }}
          >
            {validation.ok ? <Check size={14} className="mt-0.5" /> : <AlertTriangle size={14} className="mt-0.5" />}
            {validation.msg}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={save} className="btn-filled">Save changes</button>
          <Link to="/report/$slug" params={{ slug: client.slug }} target="_blank" className="btn-ghost">
            Preview report
          </Link>
        </div>
      </div>
    </div>
  );
}
