"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WeekdayStat } from "@/lib/types";

type BestPostingDayProps = {
  weekdays: WeekdayStat[];
};

export default function BestPostingDay({ weekdays }: BestPostingDayProps) {
  const formatter = useMemo(() => new Intl.NumberFormat("en-US"), []);
  const bestDay = useMemo(() => {
    if (weekdays.length === 0 || weekdays.every((day) => day.videoCount === 0)) {
      return null;
    }
    return weekdays.reduce((best, current) => {
      if (!best) {
        return current;
      }
      if (current.medianViews > best.medianViews) {
        return current;
      }
      if (
        current.medianViews === best.medianViews &&
        current.videoCount > best.videoCount
      ) {
        return current;
      }
      return best;
    }, null as WeekdayStat | null);
  }, [weekdays]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Best posting day</CardTitle>
        <CardDescription>Median views by weekday.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {bestDay ? (
          <div className="text-sm text-foreground">
            Best day:{" "}
            <span className="font-semibold">{bestDay.label}</span>{" "}
            <span className="text-muted-foreground">
              (median {formatter.format(bestDay.medianViews)} views)
            </span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Not enough data to determine a best day yet.
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Weekday</TableHead>
              <TableHead>Videos</TableHead>
              <TableHead className="text-right">Median views</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weekdays.map((day) => (
              <TableRow
                key={`weekday-${day.weekday}`}
                data-state={
                  bestDay?.weekday === day.weekday ? "selected" : "default"
                }
              >
                <TableCell className="font-medium">{day.label}</TableCell>
                <TableCell>{formatter.format(day.videoCount)}</TableCell>
                <TableCell className="text-right">
                  {formatter.format(day.medianViews)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
