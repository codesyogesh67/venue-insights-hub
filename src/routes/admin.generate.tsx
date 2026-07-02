"use client";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { clientStore } from "@/lib/clientStore";
import { validateReportShape } from "@/lib/reportSchema";

export const Route = createFileRoute("/admin/generate")({
  ssr: false,
  component: GeneratePage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

const SYSTEM_PROMPT = `You are VenueIQ, an expert restaurant and hospitality reputation analyst. Your task is to generate a realistic, plausible intelligence report for a venue based only on the venue name, address, and type.

You must output ONLY valid JSON — no markdown, no preamble, no explanation. The JSON must exactly match the VenueIQ report schema.

The report should feel like it's based on real data — use specific numbers, realistic review quotes, plausible competitor names nearby, concrete action items. Make the health score between 55–82. Make the Google rating between 3.9–4.7.

Generate 4–6 praise tags, 3–5 complaint tags, each with 2–3 short realistic review snippets.
Generate 3–5 competitors with realistic names and addresses near the venue.
Generate 6–8 priority actions.
Generate 4–6 gaps/opportunities.

The JSON schema you must follow exactly:

{
  "venue": {
    "name": string,
    "address": string,
    "neighborhood": string,
    "city": string,
    "type": string,
    "priceRange": "$" | "$$" | "$$$",
    "googleMapsUrl": "https://maps.google.com",
    "yelpUrl": "https://yelp.com",
    "tripadvisorUrl": "https://tripadvisor.com"
  },
  "meta": {
    "reportDate": string (e.g. "June 2026"),
    "analysisPeriodMonths": number,
    "sources": ["Google", "Yelp", "TripAdvisor"]
  },
  "sidebar": {
    "healthScore": number (55–82),
    "healthScoreVerdict": string (short, e.g. "Strong locally · weekend service gap"),
    "googleRating": string (e.g. "4.3 ★"),
    "totalReviewsAnalysed": number (300–2000),
    "positiveSentimentPercent": number,
    "negativeSentimentPercent": number,
    "reviewsNeedResponse": number (5–40),
    "likelyFakeReviews": number (1–8),
    "ratingTrendLabel": "Last 12 months",
    "ratingTrendValue": string (e.g. "+0.2"),
    "ratingFrom": string,
    "ratingTo": string,
    "trendPeriodMonths": 12,
    "sourcesAnalysed": ["Google", "Yelp", "TripAdvisor"]
  },
  "overview": {
    "metrics": {
      "positiveReviews": { "value": "XX%", "subLabel": "of NNN reviews", "trend": "+X pts vs last year", "trendDirection": "up" },
      "negativeReviews": { "value": "XX%", "subLabel": "NNN negative reviews", "trend": "−X pts vs last year", "trendDirection": "down" },
      "avgResponseTime": { "value": "NNh", "subLabel": "to negative reviews", "trend": "Industry: 24h", "trendDirection": "down" },
      "ratingTrajectory": { "value": "↑ +0.X", "subLabel": "over 12 months", "trend": "Was X.X → Now X.X", "trendDirection": "up" }
    },
    "monthlyVolume": {
      "months": [
        { "month": "Jun", "year": 2025, "reviewCount": number, "sentiment": "positive" | "mixed" | "negative" },
        ... 12 months total ending current month
      ]
    },
    "praiseTags": {
      "tags": [
        {
          "id": "t1",
          "label": string,
          "mentionCount": number,
          "reviews": [
            {
              "reviewerId": "r1",
              "reviewerName": string,
              "reviewerAvatarLetter": string (1 char),
              "reviewerAvatarColor": "#hex",
              "reviewerProfile": "Local Guide" | "Regular" | "First-time visitor",
              "source": "google" | "yelp" | "tripadvisor",
              "stars": number (4 or 5),
              "daysAgo": number,
              "date": "X days ago",
              "text": string (realistic review 1-3 sentences),
              "highlightedPhrase": string (key phrase from text),
              "sourceUrl": "https://example.com/review"
            }
          ]
        }
      ]
    },
    "complaintTags": {
      "tags": [ ... same structure, stars 1-3 ]
    },
    "aiSummary": {
      "paragraphs": [ string, string, string ] (3 paragraphs of plain English analysis, owner-friendly)
    }
  },
  "sentiment": {
    "byCategory": {
      "categories": [
        { "category": string, "score": number (1-10), "level": "high" | "mid" | "low", "noteForOwner": string },
        ... 5-7 categories like "Food Quality", "Service", "Value", "Atmosphere", "Speed", "Cleanliness"
      ]
    },
    "weekdayVsWeekend": {
      "weekday": { "label": "Mon–Fri", "metrics": [ { "label": string, "score": number }, ... 4 items ] },
      "weekend": { "label": "Sat–Sun", "metrics": [ { "label": string, "score": number }, ... 4 items ] },
      "gapPoints": number,
      "keyFinding": string
    },
    "mostMentionedItems": {
      "items": [ { "item": string, "mentionCount": number, "sentimentColor": "#hex" }, ... 6-8 items ]
    }
  },
  "reviews": {
    "summaryMetrics": {
      "unansweredNegative": number,
      "likelyFake": number,
      "respondedThisMonth": number,
      "avgResponseTimeHours": number
    },
    "reviewList": [
      {
        "reviewId": "rv1",
        "reviewerName": string,
        "reviewerAvatarLetter": string,
        "reviewerAvatarColor": "#hex",
        "reviewerProfile": string,
        "source": "google" | "yelp" | "tripadvisor",
        "stars": number (1-2),
        "daysAgo": number,
        "date": "X days ago",
        "status": "unanswered" | "fake",
        "reviewText": string (realistic 2-4 sentences),
        "highlightedPhrases": [string, string],
        "flagReason": string,
        "fakeSignals": [] (empty if not fake) | [string, string] (if fake),
        "sourceUrl": "https://example.com",
        "suggestedOwnerResponse": string (professional, empathetic 2-3 sentence response),
        "respondedAt": ""
      },
      ... 6-10 reviews, mix of unanswered and fake
    ]
  },
  "staff": {
    "summaryMetrics": {
      "weekdayStaffSentimentPercent": number,
      "weekendStaffSentimentPercent": number,
      "sentimentGapPoints": number
    },
    "staffMentions": {
      "entries": [
        {
          "description": string (staff mention pattern),
          "mentionCount": number,
          "sentimentScore": number (1-10),
          "sentimentDirection": "positive" | "negative",
          "typicalShift": "Weekday" | "Weekend" | "Both",
          "noteForOwner": string
        },
        ... 3-5 entries
      ]
    },
    "weekendReviewQuotes": {
      "quotes": [
        { "text": string, "source": "Google" | "Yelp", "daysAgo": number, "borderColor": "#hex" },
        ... 3-4 quotes
      ]
    },
    "recommendation": string (1-2 paragraphs plain English)
  },
  "competitors": {
    "headToHead": {
      "metrics": [
        { "metricKey": "overallRating", "metricLabel": "Overall Rating", "yourScore": number },
        { "metricKey": "foodQuality", "metricLabel": "Food Quality", "yourScore": number },
        { "metricKey": "serviceSpeed", "metricLabel": "Service Speed", "yourScore": number },
        { "metricKey": "valueMoney", "metricLabel": "Value for Money", "yourScore": number },
        { "metricKey": "atmosphere", "metricLabel": "Atmosphere", "yourScore": number }
      ],
      "winSummary": string,
      "loseSummary": string,
      "biggestGap": string
    },
    "venues": [
      {
        "venueId": "c1",
        "name": string (realistic nearby competitor name),
        "address": string (realistic nearby address),
        "distance": "0.X miles",
        "distanceMiles": number,
        "googleMapsUrl": "https://maps.google.com",
        "yelpUrl": "https://yelp.com",
        "overallRating": number (3.5-4.8),
        "reviewCount": string (e.g. "847"),
        "knownFor": string,
        "weakPoint": string,
        "vsYou": "stronger" | "weaker" | "similar",
        "scores": {
          "overallRating": number,
          "foodQuality": number,
          "coffeeScore": number,
          "serviceSpeed": number,
          "valueMoney": number,
          "atmosphere": number
        },
        "reviews": [ ... 2 reviews using same ReviewEvidence structure ],
        "opportunityForYou": string
      },
      ... 3-5 competitors total
    ]
  },
  "gaps": {
    "demandSignals": {
      "signals": [
        { "topic": string, "requestCount": number, "note": string },
        ... 4-6 signals
      ]
    },
    "gapItems": [
      {
        "gapId": "g1",
        "type": "opportunity" | "warning",
        "title": string,
        "description": string,
        "demandCount": number,
        "estimatedImpact": string,
        "icon": "🍵" | "📱" | "💳" | "🕐" | "🌿" | "📦" | "⭐" | "🔔"
      },
      ... 4-6 gap items
    ]
  },
  "actions": {
    "actions": [
      {
        "actionId": "a1",
        "priority": "high" | "medium" | "low",
        "title": string (short, specific),
        "description": string (2-3 sentences, specific and actionable),
        "expectedImpact": string,
        "estimatedCost": string (e.g. "$0", "$50–100", "$200+"),
        "estimatedTimeToSeeResult": string (e.g. "7 days", "2–4 weeks"),
        "evidencePanel": "reviews" | "sentiment" | "staff" | "competitors" | "gaps",
        "evidenceId": string
      },
      ... 6-8 actions, sorted high → medium → low priority
    ]
  }
}`;

type GenerateStep = "idle" | "generating" | "review" | "saving" | "done";

export default function GeneratePage() {
  return <GeneratePage_ />;
}

function GeneratePage_() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    venueName: "",
    address: "",
    city: "",
    venueType: "",
    contactEmail: "",
  });

  const [step, setStep] = useState<GenerateStep>("idle");
  const [rawJson, setRawJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [validation, setValidation] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  const detectTruncation = (text: string): boolean => {
    try {
      JSON.parse(text);
      return false;
    } catch {
      const trimmed = text.trimEnd();
      const opens = (trimmed.match(/{/g) ?? []).length;
      const closes = (trimmed.match(/}/g) ?? []).length;
      return opens > closes;
    }
  };

  const generate = async () => {
    if (!form.venueName || !form.city) {
      toast.error("Venue name and city are required");
      return;
    }
    setStep("generating");
    setError(null);
    setRawJson("");
    setValidation(null);

    const userPrompt = `Generate a full VenueIQ intelligence report for this venue:

Venue name: ${form.venueName}
Address: ${form.address || "Not provided"}
City: ${form.city}
Venue type: ${form.venueType || "Restaurant"}

Make the report realistic and specific to this type of venue and city. Use plausible competitor names that would actually be nearby. Make the issues and praise specific to what customers at this type of venue commonly experience.

Output ONLY the JSON object, no markdown fences, no explanation.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 16000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const text =
        data.content
          ?.map((b: { type: string; text?: string }) =>
            b.type === "text" ? b.text : ""
          )
          .join("") ?? "";

      // Strip markdown fences if present
      const clean = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      setRawJson(clean);

      // Detect truncation and validate
      const truncated = detectTruncation(clean);
      setIsTruncated(truncated);
      if (truncated) {
        setValidation({
          ok: false,
          msg: "JSON appears cut off — click Continue to complete it",
        });
        setStep("review");
        return;
      }
      try {
        const parsed = JSON.parse(clean);
        validateReportShape(parsed);
        setValidation({ ok: true, msg: "Valid — all 10 sections confirmed" });
        setStep("review");
      } catch (ve) {
        setValidation({
          ok: false,
          msg: ve instanceof Error ? ve.message : "Invalid JSON structure",
        });
        setStep("review");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      setStep("idle");
    }
  };

  const getMissingSections = (json: string): string[] => {
    const required = [
      "venue",
      "meta",
      "sidebar",
      "overview",
      "sentiment",
      "reviews",
      "staff",
      "competitors",
      "gaps",
      "actions",
    ];
    try {
      const parsed = JSON.parse(json);
      return required.filter((s) => !parsed[s]);
    } catch {
      return [];
    }
  };

  const continueGeneration = async () => {
    setIsContinuing(true);
    setError(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 8000,
          messages: (() => {
            const missing = getMissingSections(rawJson);
            const isMissingSection = missing.length > 0;
            if (isMissingSection) {
              // JSON is valid but missing whole sections — ask Claude to append them
              return [
                {
                  role: "user",
                  content: `You generated a VenueIQ JSON report but it is missing these required sections: ${missing.join(
                    ", "
                  )}. Here is the existing JSON:\n\n${rawJson}\n\nOutput ONLY the missing sections as a valid JSON fragment that can be merged. Start with a { and include only the missing top-level keys. Do not repeat existing sections. No markdown, no explanation.`,
                },
              ];
            } else {
              // JSON is truncated mid-way — ask Claude to continue from cutoff
              return [
                {
                  role: "user",
                  content: `You are continuing a JSON object that was cut off mid-generation. Output ONLY the continuation starting exactly where the text ends. Do not repeat anything. No markdown, no explanation.`,
                },
                {
                  role: "assistant",
                  content: rawJson,
                },
                {
                  role: "user",
                  content:
                    "Continue the JSON from exactly where it was cut off. Output only the missing remainder to make it a complete, valid JSON object.",
                },
              ];
            }
          })(),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "API error " + response.status);
      }

      const data = await response.json();
      const continuation =
        data.content
          ?.map((b: { type: string; text?: string }) =>
            b.type === "text" ? b.text : ""
          )
          .join("") ?? "";
      const clean = continuation
        .replace(/```json\s*/i, "")
        .replace(/```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      // Stitch together — merge if missing sections, concatenate if truncated
      let stitched: string;
      const missing = getMissingSections(rawJson);
      if (missing.length > 0) {
        // Try to merge JSON objects
        try {
          const existing = JSON.parse(rawJson);
          const fragment = JSON.parse(clean);
          const merged = { ...existing, ...fragment };
          stitched = JSON.stringify(merged, null, 2);
        } catch {
          // Fallback: string concat
          stitched =
            rawJson.trimEnd().replace(/}$/, "") +
            ",\n" +
            clean.trimStart().replace(/^{/, "");
        }
      } else {
        stitched = rawJson + clean;
      }
      setRawJson(stitched);

      // Validate stitched result
      const stillTruncated = detectTruncation(stitched);

      if (stillTruncated) {
        setIsTruncated(true);
        setValidation({
          ok: false,
          msg: "Still incomplete — click Continue again",
        });
      } else {
        try {
          const parsed = JSON.parse(stitched);
          validateReportShape(parsed);
          setIsTruncated(false);
          setValidation({ ok: true, msg: "Valid — all 10 sections confirmed" });
          toast.success("JSON completed and validated!");
        } catch (ve) {
          // JSON parsed but missing sections — keep Continue button visible
          setIsTruncated(true);
          const missingMsg =
            ve instanceof Error ? ve.message : "Missing sections";
          setValidation({
            ok: false,
            msg: missingMsg + " — click Continue to add missing sections",
          });
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      toast.error("Continue failed: " + msg);
    } finally {
      setIsContinuing(false);
    }
  };

  const publish = () => {
    if (!validation?.ok) {
      toast.error("Fix the JSON errors before publishing");
      return;
    }
    setStep("saving");
    try {
      const parsed = JSON.parse(rawJson);
      const slug = `${slugify(form.venueName)}-${Math.random()
        .toString(36)
        .slice(2, 5)}`;
      const client = clientStore.create({
        slug,
        venueName: form.venueName,
        address: form.address,
        city: form.city,
        venueType: form.venueType || "Restaurant",
        contactEmail: form.contactEmail,
        servicePlan: "Brief Intelligence Report",
        status: "active",
        reportJson: parsed,
        nextReportDue: null,
      });
      clientStore.update(client.id, { isPublished: true });
      clientStore.logActivity(
        client.id,
        "report_generated",
        "AI-generated brief report published"
      );
      setSavedSlug(slug);
      setStep("done");
      toast.success("Report published!");
    } catch (e) {
      toast.error(
        "Failed to save: " + (e instanceof Error ? e.message : "Unknown error")
      );
      setStep("review");
    }
  };

  const copyJson = () => {
    navigator.clipboard.writeText(rawJson);
    toast.success("Copied to clipboard");
  };

  const revalidate = () => {
    try {
      const parsed = JSON.parse(rawJson);
      validateReportShape(parsed);
      setValidation({ ok: true, msg: "Valid — all 10 sections confirmed" });
    } catch (e) {
      setValidation({
        ok: false,
        msg: e instanceof Error ? e.message : "Invalid",
      });
    }
  };

  return (
    <div className="p-8 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-accent-vq" />
            <span className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq">
              AI Report Generator
            </span>
          </div>
          <h1 className="font-display text-4xl">Generate a brief report</h1>
          <p className="text-muted-vq text-sm mt-1">
            Enter venue details → Claude generates the full intelligence JSON →
            one click to publish.
          </p>
        </div>
        <Link to="/admin/clients/new" className="btn-ghost text-sm shrink-0">
          Manual entry
        </Link>
      </div>

      {/* Step 1 — Venue details */}
      <div className="card-vq p-6 space-y-3">
        <h2 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq mb-3">
          Venue details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="input-vq"
            placeholder="Venue name *"
            value={form.venueName}
            onChange={(e) => setForm({ ...form, venueName: e.target.value })}
            disabled={step !== "idle"}
          />
          <input
            className="input-vq"
            placeholder="City *"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            disabled={step !== "idle"}
          />
          <input
            className="input-vq"
            placeholder="Street address (optional)"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            disabled={step !== "idle"}
          />
          <input
            className="input-vq"
            placeholder="Venue type (e.g. Italian restaurant, coffee shop)"
            value={form.venueType}
            onChange={(e) => setForm({ ...form, venueType: e.target.value })}
            disabled={step !== "idle"}
          />
          <input
            className="input-vq md:col-span-2"
            type="email"
            placeholder="Owner email (for your records)"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            disabled={step !== "idle"}
          />
        </div>

        {step === "idle" && (
          <button
            onClick={generate}
            className="btn-filled mt-2 flex items-center gap-2"
          >
            <Sparkles size={14} />
            Generate report with AI
          </button>
        )}

        {step === "generating" && (
          <div className="flex items-center gap-3 mt-4 text-accent-vq">
            <Loader2 size={18} className="animate-spin" />
            <div>
              <div className="font-medium text-sm">
                Claude is generating your report…
              </div>
              <div className="text-xs text-muted-vq">
                Analysing venue type, building competitor landscape, writing
                insights — ~20–40 seconds
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            className="flex items-start gap-2 p-3 rounded text-sm mt-2"
            style={{
              background: "rgba(255,92,92,0.1)",
              color: "var(--color-coral)",
            }}
          >
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">Generation failed</div>
              <div className="text-xs mt-0.5">{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2 — Review generated JSON */}
      {(step === "review" || step === "saving" || step === "done") && rawJson && (
        <div className="card-vq p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-mono-vq text-[11px] uppercase tracking-widest text-muted-vq">
              Generated JSON
            </h2>
            <div className="flex gap-2">
              <button
                onClick={copyJson}
                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <Copy size={12} /> Copy
              </button>
              <button
                onClick={() => setJsonExpanded(!jsonExpanded)}
                className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
              >
                {jsonExpanded ? (
                  <ChevronUp size={12} />
                ) : (
                  <ChevronDown size={12} />
                )}
                {jsonExpanded ? "Collapse" : "Expand"}
              </button>
            </div>
          </div>

          {/* Validation result */}
          {validation && (
            <div
              className="text-sm flex items-start gap-2 p-3 rounded"
              style={{
                background: validation.ok
                  ? "rgba(0,196,140,0.1)"
                  : "rgba(255,92,92,0.1)",
                color: validation.ok
                  ? "var(--color-emerald)"
                  : "var(--color-coral)",
              }}
            >
              {validation.ok ? (
                <Check size={14} className="mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              )}
              <span>{validation.msg}</span>
            </div>
          )}

          {/* JSON editor */}
          <textarea
            value={rawJson}
            onChange={(e) => {
              setRawJson(e.target.value);
              setValidation(null);
            }}
            spellCheck={false}
            className="input-vq font-mono-vq text-xs leading-relaxed"
            style={{
              minHeight: jsonExpanded ? "600px" : "200px",
              borderColor: validation
                ? validation.ok
                  ? "var(--color-emerald)"
                  : "var(--color-coral)"
                : undefined,
              caretColor: "var(--color-accent-bright)",
            }}
          />

          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex gap-2">
              <button
                onClick={revalidate}
                className="btn-ghost text-sm py-2 px-4"
              >
                Re-validate
              </button>
              {isTruncated && (
                <button
                  onClick={continueGeneration}
                  disabled={isContinuing}
                  className="btn-filled text-sm py-2 px-4 flex items-center gap-2"
                  style={{
                    background: "var(--color-accent)",
                    color: "var(--color-bg)",
                  }}
                >
                  {isContinuing ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <ArrowRight size={13} />
                  )}
                  {isContinuing ? "Continuing…" : "Continue JSON"}
                </button>
              )}
              <button
                onClick={() => {
                  setStep("idle");
                  setRawJson("");
                  setValidation(null);
                  setIsTruncated(false);
                }}
                className="btn-ghost text-sm py-2 px-4"
              >
                Regenerate
              </button>
            </div>
            <button
              onClick={publish}
              disabled={!validation?.ok || step === "saving"}
              className="btn-filled flex items-center gap-2"
            >
              {step === "saving" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Publish & create share links
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Done */}
      {step === "done" && savedSlug && (
        <div
          className="card-vq p-6 space-y-4"
          style={{ borderColor: "var(--color-emerald)" }}
        >
          <div
            className="flex items-center gap-2"
            style={{ color: "var(--color-emerald)" }}
          >
            <Check size={18} />
            <h2 className="font-mono-vq text-[11px] uppercase tracking-widest">
              Report published
            </h2>
          </div>

          <p className="text-sm text-muted-vq">
            Share these links with the venue owner:
          </p>

          {[
            {
              label: "Brief report (owner-friendly teaser)",
              path: `/brief/${savedSlug}`,
            },
            { label: "Full interactive report", path: `/report/${savedSlug}` },
          ].map(({ label, path }) => (
            <div
              key={path}
              className="rounded border border-accent-vq p-4 space-y-2"
              style={{ background: "var(--color-surface)" }}
            >
              <div className="font-mono-vq text-[10px] uppercase text-muted-vq">
                {label}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-sm text-accent-bright font-mono-vq flex-1">
                  {window.location.origin}
                  {path}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}${path}`
                    );
                    toast.success("Copied!");
                  }}
                  className="btn-ghost text-xs py-1 px-2 flex items-center gap-1 shrink-0"
                >
                  <Copy size={11} /> Copy
                </button>
                <a
                  href={path}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost text-xs py-1 px-2 flex items-center gap-1 shrink-0"
                >
                  <ExternalLink size={11} /> Preview
                </a>
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setStep("idle");
                setForm({
                  venueName: "",
                  address: "",
                  city: "",
                  venueType: "",
                  contactEmail: "",
                });
                setRawJson("");
                setSavedSlug(null);
                setValidation(null);
              }}
              className="btn-ghost flex items-center gap-2"
            >
              Generate another
            </button>
            <Link
              to="/admin/clients"
              className="btn-filled flex items-center gap-2"
            >
              View all clients <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
