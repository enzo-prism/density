export type AnalyzeResponse = {
  channel: {
    id: string;
    title: string;
    thumbnailUrl: string;
    handle?: string;
  };
  timezone: string;
  lookbackDays: number;
  startDate: string;
  endDate: string;
  days: Record<string, number>;
  stats: {
    totalPosts: number;
    currentStreak: number;
    longestStreak: number;
    lastPostedDate: string | null;
  };
  performance:
    | {
        status: "ok";
        days: Record<
          string,
          { views: number; likes: number; comments: number }
        >;
        videos: VideoPoint[];
        weekdays: WeekdayStat[];
        totals: { views: number; likes: number; comments: number };
      }
    | { status: "unavailable"; message: string };
  rank: {
    status: "ok" | "posting_only";
    windowDays: number;
    score: number;
    grade: string;
    tier: string;
    nextTier: { name: string | null; pointsToNext: number };
    breakdown: { cadence: number; consistency: number; impact: number; engagement: number };
    metrics: {
      postsPerWeek: number;
      daysPostedPct: number;
      activeWeeksPct: number;
      maxGapDays: number;
      medianViews?: number;
      medianLikesPer1k?: number;
      medianCommentsPer1k?: number;
    };
    highlights: string[];
    quests: string[];
    disclaimer: string;
  };
};

export type VideoPoint = {
  id: string;
  title: string;
  publishedAt: string;
  localDate: string;
  views: number;
  likes: number;
  comments: number;
  durationSeconds: number;
};

export type WeekdayStat = {
  weekday: number;
  label: string;
  videoCount: number;
  medianViews: number;
};

export type AnalyzeErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};
