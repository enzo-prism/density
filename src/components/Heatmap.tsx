"use client";

import { useMemo, useState } from "react";
import { dateToDayIndex, listDatesInRange } from "@/lib/dates";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekdayIndex(date: string): number {
  const utcDay = new Date(`${date}T00:00:00Z`).getUTCDay();
  return (utcDay + 6) % 7;
}

const heatmapCellVariants = cva(
  "h-4 w-4 rounded-sm border border-border transition-colors sm:h-3.5 sm:w-3.5",
  {
    variants: {
      intensity: {
        none: "bg-muted",
        low: "bg-emerald-200 dark:bg-emerald-900/60",
        mid: "bg-emerald-400 dark:bg-emerald-700",
        high: "bg-emerald-600 dark:bg-emerald-500",
        peak: "bg-emerald-800 dark:bg-emerald-300",
      },
    },
    defaultVariants: {
      intensity: "none",
    },
  }
);

function getPostsIntensity(count: number) {
  if (count >= 4) {
    return "high";
  }
  if (count >= 2) {
    return "mid";
  }
  if (count === 1) {
    return "low";
  }
  return "none";
}

function getQuantile(sorted: number[], quantile: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const index = Math.floor((sorted.length - 1) * quantile);
  return sorted[index] ?? 0;
}

function getPerformanceIntensity(value: number, thresholds: number[]) {
  if (value <= 0) {
    return "none";
  }
  const [p50, p75, p90] = thresholds;
  if (value <= p50) {
    return "low";
  }
  if (value <= p75) {
    return "mid";
  }
  if (value <= p90) {
    return "high";
  }
  return "peak";
}

export type HeatmapMetric = "posts" | "views" | "likes" | "comments";

type HeatmapProps = {
  startDate: string;
  endDate: string;
  days: Record<string, number>;
  performanceDays?: Record<string, { views: number; likes: number; comments: number }>;
  selectedMetric?: HeatmapMetric;
  onMetricChange?: (metric: HeatmapMetric) => void;
};

const metricLabels: Record<HeatmapMetric, string> = {
  posts: "Posts",
  views: "Views",
  likes: "Likes",
  comments: "Comments",
};

export default function Heatmap({
  startDate,
  endDate,
  days,
  performanceDays,
  selectedMetric,
  onMetricChange,
}: HeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [internalMetric, setInternalMetric] = useState<HeatmapMetric>("posts");
  const isControlled = selectedMetric !== undefined;
  const metric = performanceDays ? selectedMetric ?? internalMetric : "posts";
  const dates = listDatesInRange(startDate, endDate);
  const leadingEmpty = getWeekdayIndex(startDate);
  const totalCells = leadingEmpty + dates.length;
  const trailingEmpty = (7 - (totalCells % 7)) % 7;
  const cells = [
    ...Array.from({ length: leadingEmpty }).map(() => null),
    ...dates,
    ...Array.from({ length: trailingEmpty }).map(() => null),
  ];

  const startIndex = dateToDayIndex(startDate);
  const formatNumber = useMemo(
    () => new Intl.NumberFormat("en-US"),
    []
  );
  const tooltipDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    []
  );
  const metricThresholds = useMemo(() => {
    if (metric === "posts" || !performanceDays) {
      return [0, 0, 0];
    }
    const values = Object.values(performanceDays)
      .map((entry) => entry[metric] ?? 0)
      .filter((value) => value > 0)
      .sort((a, b) => a - b);
    return [
      getQuantile(values, 0.5),
      getQuantile(values, 0.75),
      getQuantile(values, 0.9),
    ];
  }, [metric, performanceDays]);

  const selectedPostsCount = selectedDate ? days[selectedDate] ?? 0 : 0;
  const selectedMetricValue =
    selectedDate && metric !== "posts" && performanceDays
      ? performanceDays[selectedDate]?.[metric] ?? 0
      : selectedDate
      ? days[selectedDate] ?? 0
      : 0;

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="text-base">Posting heatmap</CardTitle>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardDescription>
            Hover or tap a day for exact counts.
          </CardDescription>
          <ToggleGroup
            type="single"
            value={metric}
            onValueChange={(value) => {
              if (!value) {
                return;
              }
              const next = value as HeatmapMetric;
              onMetricChange?.(next);
              if (!isControlled) {
                setInternalMetric(next);
              }
            }}
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
          >
            {(Object.keys(metricLabels) as HeatmapMetric[]).map((key) => (
              <ToggleGroupItem
                key={key}
                value={key}
                aria-label={`Show ${metricLabels[key]} intensity`}
                disabled={!performanceDays && key !== "posts"}
                className="text-xs"
              >
                {metricLabels[key]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[auto_1fr] gap-4">
          <div className="grid grid-rows-7 gap-1.5 text-[10px] text-muted-foreground sm:gap-2 sm:text-[11px]">
            {dayLabels.map((label, index) => (
              <div key={label} className={index % 2 === 0 ? "" : "opacity-0"}>
                {label}
              </div>
            ))}
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="grid w-max grid-flow-col grid-rows-7 gap-1.5 sm:gap-2">
              {cells.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${startIndex}-${index}`}
                      className="h-4 w-4 rounded-sm bg-transparent sm:h-3.5 sm:w-3.5"
                    />
                  );
                }
                const postCount = days[date] ?? 0;
                const metricValue =
                  metric === "posts"
                    ? postCount
                    : performanceDays?.[date]?.[metric] ?? 0;
                const intensity =
                  metric === "posts"
                    ? getPostsIntensity(postCount)
                    : getPerformanceIntensity(metricValue, metricThresholds);
                const tooltipDate = tooltipDateFormatter.format(
                  new Date(`${date}T00:00:00Z`)
                );
                return (
                  <Tooltip key={date}>
                    <TooltipTrigger asChild>
                      <div
                        role="img"
                        aria-label={`${date} • ${postCount} post${
                          postCount === 1 ? "" : "s"
                        }`}
                        className={cn(
                          heatmapCellVariants({ intensity }),
                          "cursor-pointer"
                        )}
                        onClick={() =>
                          setSelectedDate((current) =>
                            current === date ? null : date
                          )
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-foreground">
                          {tooltipDate}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Posts: {formatNumber.format(postCount)}
                        </div>
                        {metric !== "posts" ? (
                          <div className="text-xs text-muted-foreground">
                            {metricLabels[metric]}: {formatNumber.format(metricValue)}
                          </div>
                        ) : null}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
        {selectedDate ? (
          <div className="text-xs text-muted-foreground">
            Selected: {selectedDate} • {selectedPostsCount}{" "}
            {selectedPostsCount === 1 ? "post" : "posts"}
            {metric !== "posts" ? (
              <>
                {" "}
                • {metricLabels[metric].toLowerCase()}{" "}
                {formatNumber.format(selectedMetricValue)}
              </>
            ) : null}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground sm:hidden">
            Tap a day for exact counts.
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex items-center gap-1">
            {metric === "posts"
              ? [0, 1, 2, 4].map((count) => (
                  <span
                    key={`legend-${count}`}
                    className={cn(
                      heatmapCellVariants({ intensity: getPostsIntensity(count) }),
                      "h-3 w-3 sm:h-3 sm:w-3"
                    )}
                  />
                ))
              : (["none", "low", "mid", "high", "peak"] as const).map(
                  (intensity) => (
                    <span
                      key={`legend-${intensity}`}
                      className={cn(
                        heatmapCellVariants({ intensity }),
                        "h-3 w-3 sm:h-3 sm:w-3"
                      )}
                    />
                  )
                )}
          </div>
          <span>More</span>
        </div>
        <p className="text-[11px] text-muted-foreground sm:hidden">
          Swipe to explore the full range.
        </p>
      </CardContent>
    </Card>
  );
}
