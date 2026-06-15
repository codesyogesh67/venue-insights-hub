"use client";
import { ExternalLink } from "lucide-react";
import { Avatar } from "./Avatar";
import { SourceBadge } from "./SourceBadge";
import { StarRating } from "./StarRating";
import type { ReviewEvidence } from "@/lib/reportSchema";

function highlight(text: string, phrase: string) {
  if (!phrase) return text;
  const idx = text.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[rgba(201,151,58,0.25)] text-foreground rounded px-0.5">
        {text.slice(idx, idx + phrase.length)}
      </mark>
      {text.slice(idx + phrase.length)}
    </>
  );
}

export function ReviewCard({ review, compact = false }: { review: ReviewEvidence; compact?: boolean }) {
  return (
    <div className="card-vq p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar letter={review.reviewerAvatarLetter} color={review.reviewerAvatarColor} size={compact ? 32 : 36} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{review.reviewerName}</span>
            <span className="text-xs text-muted-vq">{review.reviewerProfile}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <SourceBadge source={review.source} />
            <StarRating stars={review.stars} />
            <span className="text-xs text-muted-vq font-mono-vq">{review.date}</span>
          </div>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">
        {highlight(review.text, review.highlightedPhrase)}
      </p>
      <a
        href={review.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-xs text-blue-vq hover:underline"
      >
        View original <ExternalLink size={12} />
      </a>
    </div>
  );
}
