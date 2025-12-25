"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { VideoPoint } from "@/lib/types";

type ScatterDatum = VideoPoint & {
  timestamp: number;
};

type PerformanceScatterProps = {
  videos: VideoPoint[];
};

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0s";
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

export default function PerformanceScatter({ videos }: PerformanceScatterProps) {
  const formatter = useMemo(() => new Intl.NumberFormat("en-US"), []);
  const axisDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }),
    []
  );
  const tooltipDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    []
  );

  const data = useMemo<ScatterDatum[]>(() => {
    return videos
      .map((video) => ({
        ...video,
        timestamp: Date.parse(video.publishedAt),
      }))
      .filter((video) => Number.isFinite(video.timestamp));
  }, [videos]);

  const chartConfig = useMemo(
    () => ({
      views: {
        label: "Views",
        color: "var(--primary)",
      },
    }),
    []
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Views vs publish date</CardTitle>
        <CardDescription>
          Each bubble is a video. Bubble size reflects duration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            No videos in this range yet.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[320px] w-full aspect-auto"
          >
            <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["auto", "auto"]}
                tickFormatter={(value) =>
                  Number.isFinite(value)
                    ? axisDateFormatter.format(new Date(value))
                    : ""
                }
                tickMargin={8}
                minTickGap={24}
              />
              <YAxis
                dataKey="views"
                type="number"
                tickFormatter={(value) =>
                  Number.isFinite(value) ? formatter.format(value) : ""
                }
                width={64}
              />
              <ZAxis
                dataKey="durationSeconds"
                range={[40, 200]}
                name="Duration"
              />
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }
                  const item = payload[0].payload as ScatterDatum;
                  const tooltipDate = item.localDate
                    ? tooltipDateFormatter.format(
                        new Date(`${item.localDate}T00:00:00Z`)
                      )
                    : item.localDate;
                  return (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      hideLabel
                      hideIndicator
                      formatter={() => (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-foreground">
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tooltipDate}
                          </div>
                          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                            <span>Views</span>
                            <span className="text-foreground">
                              {formatter.format(item.views)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                            <span>Likes</span>
                            <span className="text-foreground">
                              {formatter.format(item.likes)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                            <span>Comments</span>
                            <span className="text-foreground">
                              {formatter.format(item.comments)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                            <span>Duration</span>
                            <span className="text-foreground">
                              {formatDuration(item.durationSeconds)}
                            </span>
                          </div>
                          <a
                            href={`https://www.youtube.com/watch?v=${item.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex text-xs font-semibold text-foreground underline underline-offset-4"
                          >
                            Open on YouTube
                          </a>
                        </div>
                      )}
                    />
                  );
                }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Scatter
                data={data}
                dataKey="views"
                name="views"
                fill="var(--color-views)"
                stroke="var(--color-views)"
                fillOpacity={0.7}
              />
            </ScatterChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
