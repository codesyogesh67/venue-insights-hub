import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { clientStore } from "@/lib/clientStore";
import { demoReport } from "@/data/demoReport";
import { ReportShell } from "@/components/report/ReportShell";
import type { VenueIQReport } from "@/lib/reportSchema";

export const Route = createFileRoute("/report/$slug")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `VenueIQ — Intelligence Report` },
      { name: "description", content: `Private intelligence report for ${params.slug}` },
    ],
  }),
  component: ReportPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-bg text-foreground p-6">
      <div className="text-center max-w-md">
        <h1 className="font-display text-4xl mb-3">Report not found</h1>
        <p className="text-muted-vq">This report URL is no longer active or has not been published yet.</p>
      </div>
    </div>
  ),
});

function ReportPage() {
  const { slug } = Route.useParams();
  const [report, setReport] = useState<VenueIQReport | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (slug === "bagel-shop-demo") {
      setReport(demoReport);
      return;
    }
    const c = clientStore.getBySlug(slug);
    if (!c || !c.reportJson) {
      setMissing(true);
      return;
    }
    setReport(c.reportJson);
  }, [slug]);

  if (missing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-foreground p-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-4xl mb-3">This report is not yet published</h1>
          <p className="text-muted-vq">Check back soon or contact your VenueIQ analyst.</p>
        </div>
      </div>
    );
  }
  if (!report) return <div className="min-h-screen bg-bg" />;
  return <ReportShell report={report} />;
}
