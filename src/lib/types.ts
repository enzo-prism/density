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
};

export type AnalyzeErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};
