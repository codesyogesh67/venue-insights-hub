"use client";
import { useState } from "react";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export function PdfExportButton({ targetId, fileName }: { targetId: string; fileName: string }) {
  const [busy, setBusy] = useState(false);
  const handle = async () => {
    setBusy(true);
    try {
      const el = document.getElementById(targetId);
      if (!el) throw new Error("Report container not found");
      const mod = await import("html2pdf.js");
      const html2pdf = (mod as { default: (...args: unknown[]) => unknown }).default ?? mod;
      await (html2pdf as (...args: unknown[]) => { from: (el: HTMLElement) => { set: (o: unknown) => { save: () => Promise<void> } } })()
        .from(el)
        .set({
          margin: 10,
          filename: fileName,
          image: { type: "jpeg", quality: 0.92 },
          html2canvas: { scale: 1.4, backgroundColor: "#080b12", useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .save();
      toast.success("PDF generated successfully");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate PDF — try again");
    } finally {
      setBusy(false);
    }
  };
  return (
    <button onClick={handle} disabled={busy} className="btn-filled text-sm">
      {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      {busy ? "Generating…" : "Export PDF"}
    </button>
  );
}
