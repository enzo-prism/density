"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AnalyzeResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

type DensityRankCardProps = {
  rank: AnalyzeResponse["rank"];
};

const tiers = [
  { name: "Vacuum", min: 0, tagline: "Barely there, but building." },
  { name: "Mist", min: 20, tagline: "Light presence with room to grow." },
  { name: "Solid", min: 35, tagline: "Reliable output, keep it steady." },
  { name: "Alloy", min: 50, tagline: "Structured and gaining strength." },
  { name: "Diamond", min: 65, tagline: "Sharp and consistent." },
  { name: "Neutron Star", min: 80, tagline: "Dense, focused, and powerful." },
  { name: "Black Hole", min: 90, tagline: "Extreme gravity. Unmissable." },
];

const metricHelp = {
  cadence:
    "Uploads per week in the last window. More frequent posting boosts this score.",
  consistency:
    "How evenly uploads are spread across days and weeks, with penalties for long gaps.",
  impact:
    "Median views per video in the window, scaled so outliers do not dominate.",
  engagement:
    "Likes and comments per 1,000 views, based on median ratios in the window.",
};

export default function DensityRankCard({ rank }: DensityRankCardProps) {
  const currentTier = tiers.find((tier) => tier.name === rank.tier) ?? tiers[0];
  const currentTierIndex = tiers.findIndex(
    (tier) => tier.name === currentTier.name
  );
  const nextTier = tiers[currentTierIndex + 1];
  const progress = nextTier
    ? Math.min(
        100,
        Math.max(
          0,
          ((rank.score - currentTier.min) / (nextTier.min - currentTier.min)) *
            100
        )
      )
    : 100;
  const rankId = `RANK-${rank.score}-${rank.grade}`;
  const hasNextTier = Boolean(rank.nextTier.name);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Density Rank</CardTitle>
            <CardDescription>{currentTier.tagline}</CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs uppercase tracking-[0.2em]">
            {rank.tier}
          </Badge>
        </div>
        {rank.status === "posting_only" ? (
          <div className="text-xs text-muted-foreground">
            Performance stats unavailable right now — ranking is based on posting
            consistency only.
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr] sm:items-center">
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-semibold text-foreground">
                {rank.score}
              </div>
              <div className="text-xl font-semibold text-muted-foreground">
                {rank.grade}
              </div>
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              {rankId}
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={progress} />
            <div className="text-xs text-muted-foreground">
              {hasNextTier
                ? `Next: ${rank.nextTier.name} in ${rank.nextTier.pointsToNext} pts`
                : "Top tier reached"}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Score breakdown
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="hidden sm:table-cell">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    key: "cadence",
                    label: "Cadence",
                    value: rank.breakdown.cadence,
                    note: `${rank.metrics.postsPerWeek} uploads/week`,
                  },
                  {
                    key: "consistency",
                    label: "Consistency",
                    value: rank.breakdown.consistency,
                    note: `Max gap ${rank.metrics.maxGapDays} days`,
                  },
                  {
                    key: "impact",
                    label: "Impact",
                    value: rank.breakdown.impact,
                    note:
                      rank.metrics.medianViews !== undefined
                        ? `Median ${rank.metrics.medianViews.toLocaleString()} views`
                        : "Posting-only",
                  },
                  {
                    key: "engagement",
                    label: "Engagement",
                    value: rank.breakdown.engagement,
                    note:
                      rank.metrics.medianLikesPer1k !== undefined
                        ? `${rank.metrics.medianLikesPer1k} likes/1k`
                        : "Posting-only",
                  },
                ].map((row) => (
                  <TableRow key={row.key}>
                    <TableCell>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <span className="cursor-help border-b border-dotted border-muted-foreground/70">
                            {row.label}
                          </span>
                        </HoverCardTrigger>
                        <HoverCardContent className="text-xs text-muted-foreground">
                          {metricHelp[row.key as keyof typeof metricHelp]}
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {row.value}
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                      {row.note}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Highlights
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {rank.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-foreground">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Next quests
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {rank.quests.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className={cn("text-foreground/80")}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        <Accordion type="single" collapsible>
          <AccordionItem value="how-it-works">
            <AccordionTrigger>
              How Density Rank is calculated
            </AccordionTrigger>
            <AccordionContent className="space-y-2 text-xs text-muted-foreground">
              <p>
                Density Rank combines cadence, consistency, impact, and engagement
                into a single score from 0–100. Cadence and consistency are based
                on uploads in the last {rank.windowDays} days, while impact and
                engagement use median view and reaction rates when available.
              </p>
              <p>
                The tier reflects overall density, and the progress bar shows how
                close you are to the next tier.
              </p>
              <p>{rank.disclaimer}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
