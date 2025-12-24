import { dateToDayIndex, dayIndexToDate } from "@/lib/dates";

type StatsInput = Record<string, number>;

export type StreakStats = {
  totalPosts: number;
  currentStreak: number;
  longestStreak: number;
  lastPostedDate: string | null;
};

export function computeStreakStats(days: StatsInput, endDate: string): StreakStats {
  const entries = Object.entries(days).filter(([, count]) => count > 0);
  const totalPosts = entries.reduce((sum, [, count]) => sum + count, 0);

  if (entries.length === 0) {
    return {
      totalPosts,
      currentStreak: 0,
      longestStreak: 0,
      lastPostedDate: null,
    };
  }

  const dayIndices = entries
    .map(([date]) => dateToDayIndex(date))
    .sort((a, b) => a - b);

  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < dayIndices.length; i += 1) {
    if (dayIndices[i] === dayIndices[i - 1] + 1) {
      currentRun += 1;
    } else {
      currentRun = 1;
    }
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
  }

  const lastPostedDayIndex = dayIndices[dayIndices.length - 1];
  const lastPostedDate = dayIndexToDate(lastPostedDayIndex);

  const postedSet = new Set(dayIndices);
  const endDayIndex = dateToDayIndex(endDate);

  let currentStreak = 0;
  let streakEnd = -1;
  if (postedSet.has(endDayIndex)) {
    streakEnd = endDayIndex;
  } else if (postedSet.has(endDayIndex - 1)) {
    streakEnd = endDayIndex - 1;
  }

  if (streakEnd !== -1) {
    let cursor = streakEnd;
    while (postedSet.has(cursor)) {
      currentStreak += 1;
      cursor -= 1;
    }
  }

  return {
    totalPosts,
    currentStreak,
    longestStreak,
    lastPostedDate,
  };
}

function runSanityChecks() {
  const sample = {
    "2024-01-01": 1,
    "2024-01-02": 2,
    "2024-01-04": 1,
  };
  const stats = computeStreakStats(sample, "2024-01-04");
  console.assert(stats.totalPosts === 4, "Sanity check: totalPosts");
  console.assert(stats.longestStreak === 2, "Sanity check: longestStreak");
  console.assert(stats.currentStreak === 1, "Sanity check: currentStreak");
}

if (process.env.NODE_ENV !== "production") {
  runSanityChecks();
}
