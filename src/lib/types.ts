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
