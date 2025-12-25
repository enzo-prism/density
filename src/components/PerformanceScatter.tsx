"use client";

import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactElement,
} from "react";
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
import { Button } from "@/components/ui/button";
import type { VideoPoint } from "@/lib/types";
import { cn } from "@/lib/utils";

type ScatterDatum = VideoPoint & {
  timestamp: number;
};

type PerformanceScatterProps = {
  videos: VideoPoint[];
};

type ScatterDotProps = {
  cx?: number;
  cy?: number;
  payload?: ScatterDatum;
  onMouseEnter?: React.MouseEventHandler<SVGGElement>;
  onMouseLeave?: React.MouseEventHandler<SVGGElement>;
};

function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined" || !window.matchMedia) {
        return () => undefined;
      }
      const media = window.matchMedia("(pointer: coarse)");
      const handler = () => onStoreChange();
      if (media.addEventListener) {
        media.addEventListener("change", handler);
      } else {
        media.addListener(handler);
      }
      return () => {
        if (media.removeEventListener) {
          media.removeEventListener("change", handler);
        } else {
          media.removeListener(handler);
        }
      };
    },
    () =>
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(pointer: coarse)")?.matches,
    () => false
  );
}

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
  const isCoarsePointer = useCoarsePointer();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAllPoints, setShowAllPoints] = useState(false);
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

  const dataByTime = useMemo(
    () => [...data].sort((a, b) => a.timestamp - b.timestamp),
    [data]
  );

  const sortedVideos = useMemo(
    () => [...data].sort((a, b) => b.timestamp - a.timestamp),
    [data]
  );

  const samplingConfig = useMemo(
    () => ({
      maxPoints: isCoarsePointer ? 900 : 1400,
      targetPoints: isCoarsePointer ? 450 : 900,
      topViews: isCoarsePointer ? 120 : 180,
    }),
    [isCoarsePointer]
  );

  const basePlotData = useMemo(() => {
    if (
      showAllPoints ||
      dataByTime.length <= samplingConfig.maxPoints ||
      dataByTime.length === 0
    ) {
      return dataByTime;
    }
    const topByViews = [...dataByTime]
      .sort((a, b) => b.views - a.views)
      .slice(0, samplingConfig.topViews);
    const selected = new Map<string, ScatterDatum>();
    for (const item of topByViews) {
      selected.set(item.id, item);
    }
    const first = dataByTime[0];
    const last = dataByTime[dataByTime.length - 1];
    if (first) {
      selected.set(first.id, first);
    }
    if (last) {
      selected.set(last.id, last);
    }
    const remainingTarget = Math.max(
      0,
      samplingConfig.targetPoints - selected.size
    );
    if (remainingTarget > 0) {
      const stride = Math.max(
        1,
        Math.floor(dataByTime.length / remainingTarget)
      );
      for (
        let index = 0;
        index < dataByTime.length && selected.size < samplingConfig.targetPoints;
        index += stride
      ) {
        const item = dataByTime[index];
        if (item) {
          selected.set(item.id, item);
        }
      }
    }
    return Array.from(selected.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }, [dataByTime, samplingConfig, showAllPoints]);

  const selectedVideo = useMemo(
    () => data.find((video) => video.id === selectedId) ?? null,
    [data, selectedId]
  );

  const plotData = useMemo(() => {
    if (!selectedVideo) {
      return basePlotData;
    }
    if (basePlotData.some((item) => item.id === selectedVideo.id)) {
      return basePlotData;
    }
    return [...basePlotData, selectedVideo].sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }, [basePlotData, selectedVideo]);

  const yAxisWidth = useMemo(() => {
    if (data.length === 0) {
      return isCoarsePointer ? 56 : 68;
    }
    const maxViews = data.reduce(
      (currentMax, item) => Math.max(currentMax, item.views),
      0
    );
    const label = formatter.format(maxViews);
    const charWidth = isCoarsePointer ? 6.5 : 7.5;
    const padding = isCoarsePointer ? 18 : 22;
    const minWidth = isCoarsePointer ? 56 : 68;
    const maxWidth = isCoarsePointer ? 88 : 104;
    const estimated = Math.ceil(label.length * charWidth + padding);
    return Math.min(maxWidth, Math.max(minWidth, estimated));
  }, [data, formatter, isCoarsePointer]);

  const disableAnimations = useMemo(() => {
    const threshold = isCoarsePointer ? 500 : 900;
    return plotData.length > threshold;
  }, [isCoarsePointer, plotData.length]);

  const axisLabelMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of dataByTime) {
      map.set(item.timestamp, axisDateFormatter.format(new Date(item.timestamp)));
    }
    return map;
  }, [axisDateFormatter, dataByTime]);

  const chartConfig = useMemo(
    () => ({
      views: {
        label: "Views",
        color: "var(--primary)",
      },
    }),
    []
  );

  const renderDot = useCallback(
    (props: unknown): ReactElement => {
      const { cx, cy, payload, onMouseEnter, onMouseLeave } =
        props as ScatterDotProps;
      if (!payload || !Number.isFinite(cx) || !Number.isFinite(cy)) {
        return <g />;
      }
      const isSelected = payload.id === selectedId;
      const baseRadius = isCoarsePointer ? 5 : 4;
      const hitRadius = isCoarsePointer ? 16 : 14;
      const ringRadius = isCoarsePointer ? 9 : 7;
      const ringColor = isCoarsePointer ? "rgb(16 185 129)" : "var(--color-views)";
      const ringOpacity = isCoarsePointer ? 1 : 0.6;
      const ringWidth = isCoarsePointer ? 3 : 2;
      return (
        <g
          data-video-dot="true"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="cursor-pointer"
        >
          <circle
            cx={cx}
            cy={cy}
            r={hitRadius}
            fill="transparent"
            onPointerDown={(event) => {
              event.stopPropagation();
              setSelectedId(payload.id);
            }}
          />
          <circle
            cx={cx}
            cy={cy}
            r={baseRadius}
            fill="var(--color-views)"
            fillOpacity={0.75}
          />
          {isSelected ? (
            <circle
              cx={cx}
              cy={cy}
              r={ringRadius}
              fill="none"
              stroke={ringColor}
              strokeOpacity={ringOpacity}
              strokeWidth={ringWidth}
            />
          ) : null}
        </g>
      );
    },
    [isCoarsePointer, selectedId]
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
          <div className="space-y-4">
            {isCoarsePointer ? (
              <div className="text-xs text-muted-foreground">
                Tap a dot to pin details below.
              </div>
            ) : null}
            {dataByTime.length > samplingConfig.maxPoints ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {showAllPoints
                    ? `Showing all ${formatter.format(dataByTime.length)} videos.`
                    : `Showing ${formatter.format(plotData.length)} of ${formatter.format(
                        dataByTime.length
                      )} videos for faster rendering.`}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 text-xs"
                  onClick={() => setShowAllPoints((current) => !current)}
                >
                  {showAllPoints ? "Show fewer" : "Show all"}
                </Button>
              </div>
            ) : null}
            <ChartContainer
              config={chartConfig}
              className="h-[380px] w-full aspect-auto sm:h-[320px]"
              onPointerDown={(event) => {
                if (!isCoarsePointer) {
                  return;
                }
                const target = event.target as Element | null;
                if (target?.closest("[data-video-dot='true']")) {
                  return;
                }
                setSelectedId(null);
              }}
            >
              <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={["auto", "auto"]}
                  tickFormatter={(value) =>
                    Number.isFinite(value)
                      ? axisLabelMap.get(value) ??
                        axisDateFormatter.format(new Date(value))
                      : ""
                  }
                  tickMargin={8}
                  minTickGap={isCoarsePointer ? 48 : 24}
                  tick={{ fontSize: isCoarsePointer ? 10 : 12 }}
                />
                <YAxis
                  dataKey="views"
                  type="number"
                  tickFormatter={(value) =>
                    Number.isFinite(value) ? formatter.format(value) : ""
                  }
                  width={yAxisWidth}
                  tick={{ fontSize: isCoarsePointer ? 10 : 12 }}
                />
                <ZAxis
                  dataKey="durationSeconds"
                  range={isCoarsePointer ? [60, 220] : [40, 200]}
                  name="Duration"
                />
                <ChartTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  allowEscapeViewBox={{ x: false, y: false }}
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
                        payload={payload.length > 0 ? [payload[0]] : payload}
                        hideLabel
                        hideIndicator
                        className="max-w-[78vw] break-words sm:max-w-[320px]"
                        formatter={() => (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-foreground line-clamp-2">
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
                          </div>
                        )}
                      />
                    );
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Scatter
                  data={plotData}
                  dataKey="views"
                  name="views"
                  fill="var(--color-views)"
                  stroke="var(--color-views)"
                  fillOpacity={0.7}
                  isAnimationActive={!disableAnimations}
                  shape={renderDot}
                />
              </ScatterChart>
            </ChartContainer>
            {selectedVideo ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">
                      {selectedVideo.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tooltipDateFormatter.format(
                        new Date(`${selectedVideo.localDate}T00:00:00Z`)
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedId(null)}
                  >
                    Clear
                  </Button>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <span>Views</span>
                    <span className="text-foreground">
                      {formatter.format(selectedVideo.views)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Likes</span>
                    <span className="text-foreground">
                      {formatter.format(selectedVideo.likes)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Comments</span>
                    <span className="text-foreground">
                      {formatter.format(selectedVideo.comments)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Duration</span>
                    <span className="text-foreground">
                      {formatDuration(selectedVideo.durationSeconds)}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
            {isCoarsePointer ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Videos in range
                </div>
                <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
                  {sortedVideos.map((video) => {
                    const label = tooltipDateFormatter.format(
                      new Date(`${video.localDate}T00:00:00Z`)
                    );
                    return (
                      <button
                        key={video.id}
                        type="button"
                        onClick={() => setSelectedId(video.id)}
                        className={cn(
                          "flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition-colors",
                          "hover:bg-muted/40",
                          selectedId === video.id ? "bg-muted/50" : ""
                        )}
                      >
                        <div className="min-w-0">
                          <div className="line-clamp-1 font-medium text-foreground">
                            {video.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {label}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatter.format(video.views)} views
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
