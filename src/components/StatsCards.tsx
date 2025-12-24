import type { AnalyzeResponse } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Stats = AnalyzeResponse["stats"];

type StatsCardsProps = {
  stats: Stats;
};

function StatCard(props: { label: string; value: string; hint?: string }) {
  const { label, value, hint } = props;
  return (
    <Card className="gap-3">
      <CardHeader className="pb-0">
        <CardDescription className="text-xs font-semibold uppercase tracking-[0.2em]">
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <CardTitle className="text-3xl font-display">{value}</CardTitle>
        {hint ? (
          <CardDescription className="mt-1 text-xs">{hint}</CardDescription>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
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
