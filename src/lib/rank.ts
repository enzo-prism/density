import { dateToDayIndex } from "@/lib/dates";
import type { RankedUpload } from "@/lib/youtube";

export type RankStats = {
  views: number;
  likes: number;
  comments: number;
};

export type RankResult = {
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

type CadenceThreshold = { postsPerWeek: number; score: number };

const CADENCE_THRESHOLDS: CadenceThreshold[] = [
  { postsPerWeek: 0, score: 0 },
  { postsPerWeek: 0.5, score: 10 },
  { postsPerWeek: 1, score: 18 },
  { postsPerWeek: 2, score: 28 },
  { postsPerWeek: 4, score: 36 },
  { postsPerWeek: 7, score: 40 },
];

const TIERS = [
  { name: "Vacuum", minScore: 0 },
  { name: "Mist", minScore: 20 },
  { name: "Solid", minScore: 35 },
  { name: "Alloy", minScore: 50 },
  { name: "Diamond", minScore: 65 },
  { name: "Neutron Star", minScore: 80 },
  { name: "Black Hole", minScore: 90 },
];

const DISCLAIMER =
  "Not affiliated with YouTube; based on public data.";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function scoreCadence(postsPerWeek: number): number {
  if (postsPerWeek <= CADENCE_THRESHOLDS[0].postsPerWeek) {
    return 0;
  }
  for (let i = 1; i < CADENCE_THRESHOLDS.length; i += 1) {
    const prev = CADENCE_THRESHOLDS[i - 1];
    const next = CADENCE_THRESHOLDS[i];
    if (postsPerWeek <= next.postsPerWeek) {
      const span = next.postsPerWeek - prev.postsPerWeek;
      const ratio = span === 0 ? 1 : (postsPerWeek - prev.postsPerWeek) / span;
      return prev.score + ratio * (next.score - prev.score);
    }
  }
  return CADENCE_THRESHOLDS[CADENCE_THRESHOLDS.length - 1].score;
}

function scoreConsistency(
  activeWeeksPct: number,
  daysPostedPct: number,
  maxGapDays: number
): number {
  const base = 35 * (0.6 * activeWeeksPct + 0.4 * daysPostedPct);
  let penalty = 0;
  if (maxGapDays > 30) {
    penalty = 18;
  } else if (maxGapDays > 14) {
    penalty = 12;
  } else if (maxGapDays > 7) {
    penalty = 6;
  }
  return clamp(base - penalty, 0, 35);
}

function scoreImpact(medianViews: number) {
  if (!Number.isFinite(medianViews) || medianViews <= 0) {
    return 0;
  }
  const scaled = (Math.log10(medianViews + 1) / 6) * 15;
  return clamp(scaled, 0, 15);
}

function scoreEngagement(medianLikesPer1k: number, medianCommentsPer1k: number) {
  const likesScore = (medianLikesPer1k / 15) * 8;
  const commentsScore = (medianCommentsPer1k / 2) * 2;
  return clamp(likesScore + commentsScore, 0, 10);
}

function mapGrade(score: number): string {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 60) return "D";
  return "F";
}

function mapTier(score: number) {
  let tier = TIERS[0];
  for (const candidate of TIERS) {
    if (score >= candidate.minScore) {
      tier = candidate;
    } else {
      break;
    }
  }
  const nextIndex = TIERS.findIndex((item) => item.name === tier.name) + 1;
  const nextTier = TIERS[nextIndex];
  return {
    tier: tier.name,
    nextTier: nextTier
      ? {
          name: nextTier.name,
          pointsToNext: clamp(nextTier.minScore - score, 0, 100),
        }
      : { name: null, pointsToNext: 0 },
  };
}

export function computeDensityRank(options: {
  rankWindowDays: number;
  endDate: string;
  dayCounts: Record<string, number>;
  rankedUploads: RankedUpload[];
  statsById?: Map<string, RankStats>;
}): RankResult {
  const { rankWindowDays, endDate, dayCounts, rankedUploads, statsById } = options;
  const windowDays = Math.max(1, Math.floor(rankWindowDays));
  const endDayIndex = dateToDayIndex(endDate);
  const startDayIndex = endDayIndex - windowDays + 1;

  let totalUploads = 0;
  const postedDays = new Set<number>();
  for (const [date, count] of Object.entries(dayCounts)) {
    const dayIndex = dateToDayIndex(date);
    if (dayIndex < startDayIndex || dayIndex > endDayIndex) {
      continue;
    }
    if (count > 0) {
      postedDays.add(dayIndex);
      totalUploads += count;
    }
  }

  const postsPerWeek = totalUploads / (windowDays / 7);
  const daysPostedPct = postedDays.size / windowDays;
  const totalWeeks = Math.max(1, Math.ceil(windowDays / 7));
  const activeWeeks = new Array<boolean>(totalWeeks).fill(false);
  for (const dayIndex of postedDays) {
    const weekIndex = Math.floor((dayIndex - startDayIndex) / 7);
    if (weekIndex >= 0 && weekIndex < activeWeeks.length) {
      activeWeeks[weekIndex] = true;
    }
  }
  const activeWeeksCount = activeWeeks.filter(Boolean).length;
  const activeWeeksPct = activeWeeksCount / totalWeeks;

  let maxGapDays = 0;
  let currentGap = 0;
  for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex += 1) {
    if (postedDays.has(dayIndex)) {
      maxGapDays = Math.max(maxGapDays, currentGap);
      currentGap = 0;
    } else {
      currentGap += 1;
    }
  }
  maxGapDays = Math.max(maxGapDays, currentGap);

  const cadenceScore = scoreCadence(postsPerWeek);
  const consistencyScore = scoreConsistency(activeWeeksPct, daysPostedPct, maxGapDays);

  let medianViews = 0;
  let medianLikesPer1k = 0;
  let medianCommentsPer1k = 0;
  let impactScore = 0;
  let engagementScore = 0;
  let status: "ok" | "posting_only" = "posting_only";

  if (statsById && statsById.size > 0) {
    const views: number[] = [];
    const likesPer1k: number[] = [];
    const commentsPer1k: number[] = [];
    for (const upload of rankedUploads) {
      const stats = statsById.get(upload.videoId);
      if (!stats) {
        continue;
      }
      views.push(stats.views);
      if (stats.views > 0) {
        likesPer1k.push((stats.likes / stats.views) * 1000);
        commentsPer1k.push((stats.comments / stats.views) * 1000);
      }
    }
    medianViews = median(views);
    medianLikesPer1k = median(likesPer1k);
    medianCommentsPer1k = median(commentsPer1k);
    impactScore = scoreImpact(medianViews);
    engagementScore = scoreEngagement(medianLikesPer1k, medianCommentsPer1k);
    status = "ok";
  }

  const score = clamp(
    Math.round(cadenceScore + consistencyScore + impactScore + engagementScore),
    0,
    100
  );
  const grade = mapGrade(score);
  const tierInfo = mapTier(score);

  const highlights: string[] = [];
  const quests: string[] = [];

  if (postsPerWeek >= 1) {
    highlights.push(`${postsPerWeek.toFixed(1)} uploads/week`);
  }
  if (activeWeeksPct >= 0.85) {
    highlights.push(`Active ${Math.round(activeWeeksPct * 100)}% of weeks`);
  }
  if (maxGapDays <= 7) {
    highlights.push("No gaps longer than a week");
  } else if (maxGapDays <= 14) {
    highlights.push(`Longest gap ${maxGapDays} days`);
  }
  if (status === "ok" && medianViews > 0) {
    highlights.push(`Median ${Math.round(medianViews).toLocaleString()} views/video`);
  }

  if (postsPerWeek < 2) {
    quests.push("Add 1 more upload day each week");
  }
  if (maxGapDays > 7) {
    quests.push("Avoid gaps > 7 days for a big boost");
  }
  if (activeWeeksPct < 0.9) {
    quests.push("Post at least once every week");
  }
  if (status === "ok" && impactScore < 6) {
    quests.push("Experiment with titles/thumbnails (median views is low)");
  }

  const trimmedHighlights = highlights.slice(0, 4);
  const trimmedQuests = quests.slice(0, 3);

  return {
    status,
    windowDays,
    score,
    grade,
    tier: tierInfo.tier,
    nextTier: tierInfo.nextTier,
    breakdown: {
      cadence: Math.round(cadenceScore),
      consistency: Math.round(consistencyScore),
      impact: Math.round(impactScore),
      engagement: Math.round(engagementScore),
    },
    metrics: {
      postsPerWeek: Number(postsPerWeek.toFixed(1)),
      daysPostedPct: Number(daysPostedPct.toFixed(3)),
      activeWeeksPct: Number(activeWeeksPct.toFixed(3)),
      maxGapDays,
      medianViews: status === "ok" ? Math.round(medianViews) : undefined,
      medianLikesPer1k: status === "ok" ? Number(medianLikesPer1k.toFixed(2)) : undefined,
      medianCommentsPer1k: status === "ok"
        ? Number(medianCommentsPer1k.toFixed(2))
        : undefined,
    },
    highlights: trimmedHighlights.length > 0 ? trimmedHighlights : ["Building momentum"],
    quests: trimmedQuests.length > 0 ? trimmedQuests : ["Stay consistent for the next boost"],
    disclaimer: DISCLAIMER,
  };
}
