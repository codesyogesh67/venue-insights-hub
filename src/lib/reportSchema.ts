export interface ReviewEvidence {
  reviewerId: string;
  reviewerName: string;
  reviewerAvatarLetter: string;
  reviewerAvatarColor: string;
  reviewerProfile: string;
  source: "google" | "yelp" | "tripadvisor";
  stars: number;
  daysAgo: number;
  date: string;
  text: string;
  highlightedPhrase: string;
  sourceUrl: string;
}

export interface VenueIQReport {
  venue: {
    name: string;
    address: string;
    neighborhood: string;
    city: string;
    type: string;
    priceRange: string;
    googleMapsUrl: string;
    yelpUrl: string;
    tripadvisorUrl: string;
  };
  meta: {
    reportDate: string;
    analysisPeriodMonths: number;
    sources: string[];
  };
  sidebar: {
    healthScore: number;
    healthScoreVerdict: string;
    googleRating: string;
    totalReviewsAnalysed: number;
    positiveSentimentPercent: number;
    negativeSentimentPercent: number;
    reviewsNeedResponse: number;
    likelyFakeReviews: number;
    ratingTrendLabel: string;
    ratingTrendValue: string;
    ratingFrom: string;
    ratingTo: string;
    trendPeriodMonths: number;
    sourcesAnalysed: string[];
  };
  overview: {
    metrics: {
      positiveReviews: MetricCard;
      negativeReviews: MetricCard;
      avgResponseTime: MetricCard;
      ratingTrajectory: MetricCard;
    };
    monthlyVolume: {
      months: Array<{
        month: string;
        year: number;
        reviewCount: number;
        sentiment: "positive" | "mixed" | "negative";
      }>;
    };
    praiseTags: { tags: TagWithEvidence[] };
    complaintTags: { tags: TagWithEvidence[] };
    aiSummary: { paragraphs: string[] };
  };
  sentiment: {
    byCategory: {
      categories: Array<{
        category: string;
        score: number;
        level: "high" | "mid" | "low";
        noteForOwner: string;
      }>;
    };
    weekdayVsWeekend: {
      weekday: { label: string; metrics: Array<{ label: string; score: number }> };
      weekend: { label: string; metrics: Array<{ label: string; score: number }> };
      gapPoints: number;
      keyFinding: string;
    };
    mostMentionedItems: {
      items: Array<{ item: string; mentionCount: number; sentimentColor: string }>;
    };
  };
  reviews: {
    summaryMetrics: {
      unansweredNegative: number;
      likelyFake: number;
      respondedThisMonth: number;
      avgResponseTimeHours: number;
    };
    reviewList: Array<AlertReview>;
  };
  staff: {
    summaryMetrics: {
      weekdayStaffSentimentPercent: number;
      weekendStaffSentimentPercent: number;
      sentimentGapPoints: number;
    };
    staffMentions: {
      entries: Array<{
        description: string;
        mentionCount: number;
        sentimentScore: number;
        sentimentDirection: "positive" | "negative";
        typicalShift: string;
        noteForOwner: string;
      }>;
    };
    weekendReviewQuotes: {
      quotes: Array<{ text: string; source: string; daysAgo: number; borderColor: string }>;
    };
    recommendation: string;
  };
  competitors: {
    headToHead: {
      metrics: Array<{ metricKey: string; metricLabel: string; yourScore: number }>;
      winSummary: string;
      loseSummary: string;
      biggestGap: string;
    };
    venues: Array<CompetitorVenue>;
  };
  gaps: {
    demandSignals: {
      signals: Array<{ topic: string; requestCount: number; note: string }>;
    };
    gapItems: Array<{
      gapId: string;
      type: "opportunity" | "warning";
      title: string;
      description: string;
      demandCount: number;
      estimatedImpact: string;
      icon: string;
    }>;
  };
  actions: {
    actions: Array<{
      actionId: string;
      priority: "high" | "medium" | "low";
      title: string;
      description: string;
      expectedImpact: string;
      estimatedCost: string;
      estimatedTimeToSeeResult: string;
      evidencePanel: string;
      evidenceId: string;
    }>;
  };
}

export interface MetricCard {
  value: string;
  subLabel: string;
  trend: string;
  trendDirection: "up" | "down";
}

export interface TagWithEvidence {
  id: string;
  label: string;
  mentionCount: number;
  reviews: ReviewEvidence[];
}

export interface AlertReview {
  reviewId: string;
  reviewerName: string;
  reviewerAvatarLetter: string;
  reviewerAvatarColor: string;
  reviewerProfile: string;
  source: "google" | "yelp" | "tripadvisor";
  stars: number;
  daysAgo: number;
  date: string;
  status: "unanswered" | "fake" | "responded";
  reviewText: string;
  highlightedPhrases: string[];
  flagReason: string;
  fakeSignals: string[];
  sourceUrl: string;
  suggestedOwnerResponse: string;
  respondedAt: string;
}

export interface CompetitorVenue {
  venueId: string;
  name: string;
  address: string;
  distance: string;
  distanceMiles: number;
  googleMapsUrl: string;
  yelpUrl: string;
  overallRating: number;
  reviewCount: string;
  knownFor: string;
  weakPoint: string;
  vsYou: "stronger" | "weaker" | "similar";
  scores: {
    overallRating: number;
    foodQuality: number;
    coffeeScore: number;
    serviceSpeed: number;
    valueMoney: number;
    atmosphere: number;
  };
  reviews: ReviewEvidence[];
  opportunityForYou: string;
}

/** Lightweight validator — confirms top-level sections exist. Throws with field path on failure. */
export function validateReportShape(input: unknown): VenueIQReport {
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
  if (!input || typeof input !== "object") throw new Error("Report must be a JSON object");
  const obj = input as Record<string, unknown>;
  for (const key of required) {
    if (!(key in obj)) throw new Error(`Missing required section: ${key}`);
  }
  const sidebar = obj.sidebar as Record<string, unknown>;
  if (typeof sidebar.healthScore !== "number")
    throw new Error("Missing required field: sidebar.healthScore");
  const venue = obj.venue as Record<string, unknown>;
  if (typeof venue.name !== "string") throw new Error("Missing required field: venue.name");
  return input as VenueIQReport;
}
