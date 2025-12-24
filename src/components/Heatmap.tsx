"use client";

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
  "h-3.5 w-3.5 rounded-sm border border-border transition-colors",
  {
    variants: {
      intensity: {
        none: "bg-muted",
        low: "bg-muted-foreground/30",
        mid: "bg-muted-foreground/60",
        high: "bg-foreground",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Posting heatmap</CardTitle>
        <CardDescription>Hover a day for exact counts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[auto_1fr] gap-4">
          <div className="grid grid-rows-7 gap-2 text-[11px] text-muted-foreground">
            {dayLabels.map((label, index) => (
              <div key={label} className={index % 2 === 0 ? "" : "opacity-0"}>
                {label}
              </div>
            ))}
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="grid w-max grid-flow-col grid-rows-7 gap-2">
              {cells.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${startIndex}-${index}`}
                      className="h-3.5 w-3.5 rounded-sm bg-transparent"
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
                          heatmapCellVariants({ intensity: getIntensity(count) })
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 4].map((count) => (
              <span
                key={`legend-${count}`}
                className={cn(
                  heatmapCellVariants({ intensity: getIntensity(count) }),
                  "h-3 w-3"
                )}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
