"use client";

import { useState } from "react";
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
      },
    },
    defaultVariants: {
      intensity: "none",
    },
  }
);

function getIntensity(count: number) {
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
};

export default function Heatmap({ startDate, endDate, days }: HeatmapProps) {
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
  const selectedCount = selectedDate ? days[selectedDate] ?? 0 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Posting heatmap</CardTitle>
        <CardDescription>Hover or tap a day for exact counts.</CardDescription>
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
                const count = days[date] ?? 0;
                const label = `${date} • ${count} post${count === 1 ? "" : "s"}`;
                return (
                  <Tooltip key={date}>
                    <TooltipTrigger asChild>
                      <div
                        role="img"
                        aria-label={label}
                        className={cn(
                          heatmapCellVariants({ intensity: getIntensity(count) }),
                          "cursor-pointer"
                        )}
                        onClick={() =>
                          setSelectedDate((current) =>
                            current === date ? null : date
                          )
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
        {selectedDate ? (
          <div className="text-xs text-muted-foreground">
            Selected: {selectedDate} • {selectedCount}{" "}
            {selectedCount === 1 ? "post" : "posts"}
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
                  heatmapCellVariants({ intensity: getIntensity(count) }),
                  "h-3 w-3 sm:h-3 sm:w-3"
                )}
              />
            ))}
          </div>
          <span>More</span>
        </div>
        <p className="text-[11px] text-muted-foreground sm:hidden">
          Swipe to explore the full year.
        </p>
      </CardContent>
    </Card>
  );
}
