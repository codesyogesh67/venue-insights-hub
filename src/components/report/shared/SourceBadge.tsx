interface Props {
  source: "google" | "yelp" | "tripadvisor";
}
const styles: Record<Props["source"], { bg: string; text: string; label: string }> = {
  google: { bg: "rgba(78,158,255,0.15)", text: "#4e9eff", label: "GOOGLE" },
  yelp: { bg: "rgba(255,92,92,0.15)", text: "#ff5c5c", label: "YELP" },
  tripadvisor: { bg: "rgba(0,196,140,0.15)", text: "#00c48c", label: "TRIPADVISOR" },
};
export function SourceBadge({ source }: Props) {
  const s = styles[source];
  return (
    <span
      className="badge-mono font-bold"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}
