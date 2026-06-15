"use client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, AlertTriangle } from "lucide-react";
import { clientStore } from "@/lib/clientStore";
import { validateReportShape } from "@/lib/reportSchema";
import { demoReport } from "@/data/demoReport";

export const Route = createFileRoute("/admin/clients/new")({
  ssr: false,
  component: NewClient,
});

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
}

function NewClient() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    venueName: "", address: "", city: "", venueType: "", contactEmail: "", servicePlan: "Review Intelligence Report",
  });
  const [json, setJson] = useState("");
  const [validation, setValidation] = useState<{ ok: boolean; msg: string } | null>(null);

  const next = () => {
    if (!form.venueName) return toast.error("Venue name required");
    setStep(2);
  };

  const validate = () => {
    try {
      const parsed = JSON.parse(json);
      validateReportShape(parsed);
      setValidation({ ok: true, msg: "Valid JSON — all 10 sections found" });
      return parsed;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setValidation({ ok: false, msg });
      return null;
    }
  };

  const format = () => {
    try {
      setJson(JSON.stringify(JSON.parse(json), null, 2));
      toast.success("Formatted");
    } catch {
      toast.error("Cannot format — JSON is invalid");
    }
  };

  const loadDemo = () => {
    setJson(JSON.stringify(demoReport, null, 2));
    toast.success("Loaded demo report JSON");
  };

  const create = () => {
    const parsed = validate();
    if (!parsed) return;
    const client = clientStore.create({
      slug: `${slugify(form.venueName)}-${Math.random().toString(36).slice(2, 5)}`,
      venueName: form.venueName,
      address: form.address,
      city: form.city,
      venueType: form.venueType,
      contactEmail: form.contactEmail,
      servicePlan: form.servicePlan,
      status: "active",
      reportJson: parsed,
      nextReportDue: null,
    });
    clientStore.update(client.id, { isPublished: true });
    clientStore.logActivity(client.id, "report_generated", "Initial report generated and published");
    toast.success(`Report published — /report/${client.slug}`);
    navigate({ to: "/admin/clients/$id", params: { id: client.id } });
  };

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-4xl">New client report</h1>
        <p className="text-muted-vq text-sm">Step {step} of 2</p>
      </div>

      {step === 1 && (
        <div className="card-vq p-6 space-y-3">
          <h2 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq mb-2">Venue details</h2>
          {[
            ["venueName", "Venue name *"],
            ["address", "Address"],
            ["city", "City"],
            ["venueType", "Venue type"],
            ["contactEmail", "Contact email"],
            ["servicePlan", "Service plan"],
          ].map(([k, l]) => (
            <input key={k} className="input-vq" placeholder={l} value={form[k as keyof typeof form]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ))}
          <button onClick={next} className="btn-filled mt-2">Next: paste JSON</button>
        </div>
      )}

      {step === 2 && (
        <div className="card-vq p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq">Paste report JSON</h2>
            <div className="flex gap-2">
              <button onClick={loadDemo} className="btn-ghost text-xs py-1.5 px-3">Load demo</button>
              <button onClick={format} className="btn-ghost text-xs py-1.5 px-3">Format</button>
              <button onClick={validate} className="btn-ghost text-xs py-1.5 px-3">Validate</button>
            </div>
          </div>
          <textarea
            value={json}
            onChange={(e) => { setJson(e.target.value); setValidation(null); }}
            placeholder="{ ...VenueIQ report JSON... }"
            spellCheck={false}
            className="input-vq min-h-[420px] font-mono-vq text-xs leading-relaxed"
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
          <div className="flex justify-between gap-2 pt-2">
            <button onClick={() => setStep(1)} className="btn-ghost">Back</button>
            <button onClick={create} disabled={!validation?.ok} className="btn-filled">Publish & generate share link</button>
          </div>
        </div>
      )}
    </div>
  );
}
