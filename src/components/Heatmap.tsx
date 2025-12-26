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

type HeatmapProps = {
  startDate: string;
  endDate: string;
  days: Record<string, number>;
  dayBreakdown?: Record<string, { videos: number; shorts: number }>;
};

export default function Heatmap({
  startDate,
  endDate,
  days,
  dayBreakdown,
}: HeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }),
    []
  );

  const selectedPostsCount = selectedDate ? days[selectedDate] ?? 0 : 0;
  const selectedBreakdown = selectedDate ? dayBreakdown?.[selectedDate] : undefined;
  const selectedVideosCount = selectedBreakdown?.videos ?? 0;
  const selectedShortsCount = selectedBreakdown?.shorts ?? 0;
  const selectedUnknownCount = selectedDate
    ? Math.max(0, selectedPostsCount - (selectedVideosCount + selectedShortsCount))
    : 0;
  const adjustedVideosCount = selectedVideosCount + selectedUnknownCount;
  const selectedBreakdownLabel = selectedDate && dayBreakdown
    ? [
        adjustedVideosCount > 0
          ? `${adjustedVideosCount} ${
              adjustedVideosCount === 1 ? "video" : "videos"
            }`
          : null,
        selectedShortsCount > 0
          ? `${selectedShortsCount} ${
              selectedShortsCount === 1 ? "short" : "shorts"
            }`
          : null,
      ]
        .filter(Boolean)
        .join(", ")
    : "";
  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="text-base">Posting heatmap</CardTitle>
        <CardDescription>
          Hover or tap a day for exact counts.
        </CardDescription>
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
                const intensity = getPostsIntensity(postCount);
                const tooltipDate = tooltipDateFormatter.format(
                  new Date(`${date}T00:00:00Z`)
                );
                const isSelected = selectedDate === date;
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
                          "cursor-pointer",
                          isSelected
                            ? "ring-2 ring-emerald-500 ring-offset-1 ring-offset-background dark:ring-emerald-300"
                            : ""
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
                        <div className="text-xs font-medium text-background">
                          {tooltipDate}
                        </div>
                        <div className="text-xs text-background/70">
                          Posts: {formatNumber.format(postCount)}
                        </div>
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
            {dayBreakdown ? (
              selectedBreakdownLabel ? (
                <> ({selectedBreakdownLabel})</>
              ) : null
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
            {[0, 1, 2, 4].map((count) => (
              <span
                key={`legend-${count}`}
                className={cn(
                  heatmapCellVariants({ intensity: getPostsIntensity(count) }),
                  "h-3 w-3 sm:h-3 sm:w-3"
                )}
              />
            ))}
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
