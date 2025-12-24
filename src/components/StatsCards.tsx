import type { AnalyzeResponse } from "@/lib/types";

type Stats = AnalyzeResponse["stats"];

type StatsCardsProps = {
  stats: Stats;
};

function StatCard(props: { label: string; value: string; hint?: string }) {
  const { label, value, hint } = props;
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
      {hint ? (
        <div className="mt-1 text-xs text-slate-500">{hint}</div>
      ) : null}
    </div>
  );
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        label="Total posts"
        value={stats.totalPosts.toLocaleString()}
        hint={stats.lastPostedDate ? `Last post: ${stats.lastPostedDate}` : ""}
      />
      <StatCard
        label="Current streak"
        value={`${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}`}
        hint="Includes today if posted"
      />
      <StatCard
        label="Longest streak"
        value={`${stats.longestStreak} day${stats.longestStreak === 1 ? "" : "s"}`}
        hint="Max consecutive days"
      />
    </div>
  );
}
