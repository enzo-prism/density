"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Heatmap from "@/components/Heatmap";
import type { HeatmapMetric } from "@/components/Heatmap";
import StatsCards from "@/components/StatsCards";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyzeResponse } from "@/lib/types";

const PerformanceScatter = dynamic(
  () => import("@/components/PerformanceScatter"),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    ),
  }
);

const BestPostingDay = dynamic(() => import("@/components/BestPostingDay"), {
  ssr: false,
  loading: () => (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  ),
});

const UploadMomentumChart = dynamic(
  () => import("@/components/UploadMomentumChart"),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    ),
  }
);

type HomeResultsProps = {
  result: AnalyzeResponse | null;
  loading: boolean;
  resultRange: "days" | "lifetime";
  channelUrl: string | null;
  onCopyShareLink: () => void;
};

function getInitials(title: string) {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "D";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function HomeResults({
  result,
  loading,
  resultRange,
  channelUrl,
  onCopyShareLink,
}: HomeResultsProps) {
  const showSkeletons = loading;
  const [metric, setMetric] = useState<HeatmapMetric>("posts");
  const [performanceReady, setPerformanceReady] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return typeof IntersectionObserver === "undefined";
  });
  const performanceRef = useRef<HTMLDivElement | null>(null);
  const performance = result?.performance;
  const performanceOk = performance?.status === "ok";
  const performanceDays = performanceOk ? performance.days : undefined;
  const performanceVideos =
    performanceOk && performance?.status === "ok" ? performance.videos : null;
  const dayBreakdown = useMemo(() => {
    if (!performanceVideos) {
      return undefined;
    }
    const breakdown: Record<string, { videos: number; shorts: number }> = {};
    for (const video of performanceVideos) {
      const date = video.localDate;
      if (!date) {
        continue;
      }
      const isShort = video.durationSeconds > 0 && video.durationSeconds <= 60;
      const entry = breakdown[date] ?? { videos: 0, shorts: 0 };
      if (isShort) {
        entry.shorts += 1;
      } else {
        entry.videos += 1;
      }
      breakdown[date] = entry;
    }
    return breakdown;
  }, [performanceVideos]);
  const totalsSummary = useMemo(() => {
    if (!performanceOk || !performance || performance.status !== "ok") {
      return null;
    }
    const formatter = new Intl.NumberFormat("en-US");
    return `Views ${formatter.format(
      performance.totals.views
    )} • Likes ${formatter.format(
      performance.totals.likes
    )} • Comments ${formatter.format(performance.totals.comments)}`;
  }, [performanceOk, performance]);

  const heatmapMetric = performanceOk ? metric : "posts";

  useEffect(() => {
    if (!result) {
      return;
    }
    const requestIdle = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    const cancelIdle = (
      window as Window & { cancelIdleCallback?: (id: number) => void }
    ).cancelIdleCallback;
    let idleId: number | null = null;
    let timeoutId: number | null = null;
    const prefetch = () => {
      void import("@/components/UploadMomentumChart");
      void import("@/components/PerformanceScatter");
      void import("@/components/BestPostingDay");
    };
    if (requestIdle) {
      idleId = requestIdle(prefetch, { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(prefetch, 800);
    }
    return () => {
      if (idleId !== null && cancelIdle) {
        cancelIdle(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [result]);

  useEffect(() => {
    if (!performanceOk || performanceReady) {
      return;
    }
    const node = performanceRef.current;
    if (!node) {
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPerformanceReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [performanceOk, performanceReady]);

  return (
    <section
      className="flex flex-col gap-6 motion-safe:animate-[fade-up_0.6s_ease-out]"
      style={{ animationDelay: "140ms" }}
    >
      <div className="order-1">
        {showSkeletons ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg sm:h-14 sm:w-14" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Skeleton className="h-9 w-full sm:w-32" />
                  <Skeleton className="h-9 w-full sm:w-36" />
                </div>
              </div>
              <Separator />
              <Skeleton className="h-4 w-72" />
            </CardContent>
          </Card>
        ) : result ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                    <AvatarImage
                      src={result.channel.thumbnailUrl}
                      alt={`${result.channel.title} thumbnail`}
                    />
                    <AvatarFallback>
                      {getInitials(result.channel.title)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl font-display">
                      {result.channel.title}
                    </CardTitle>
                    {result.channel.handle ? (
                      <CardDescription>{result.channel.handle}</CardDescription>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  {channelUrl ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <a href={channelUrl} target="_blank" rel="noreferrer">
                        View on YouTube
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={onCopyShareLink}
                  >
                    Copy share link
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <span>
                  {result.startDate} → {result.endDate}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>
                  {resultRange === "lifetime"
                    ? "Lifetime"
                    : `${result.lookbackDays} days`}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{result.timezone}</span>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="order-3">
        {showSkeletons ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`stat-skel-${index}`} className="h-28 w-full" />
            ))}
          </div>
        ) : result ? (
          <StatsCards stats={result.stats} />
        ) : null}
      </div>

      <div className="order-2">
        {showSkeletons ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ) : result ? (
          <TooltipProvider delayDuration={150}>
            <Heatmap
              startDate={result.startDate}
              endDate={result.endDate}
              days={result.days}
              performanceDays={performanceDays}
              dayBreakdown={dayBreakdown}
              selectedMetric={heatmapMetric}
              onMetricChange={setMetric}
            />
          </TooltipProvider>
        ) : null}
      </div>

      <div className="order-4">
        {showSkeletons ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-52 w-full" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ) : result ? (
          <UploadMomentumChart
            days={result.days}
            startDate={result.startDate}
            endDate={result.endDate}
            timezone={result.timezone}
          />
        ) : null}
      </div>

      {!showSkeletons && result ? (
        <div ref={performanceRef} className="order-5 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Performance overlay
              </h2>
              <p className="text-xs text-muted-foreground">
                Views, likes, comments, and duration context for each upload.
              </p>
            </div>
            {totalsSummary ? (
              <div className="text-xs text-muted-foreground">
                {totalsSummary}
              </div>
            ) : null}
          </div>
          {performance?.status === "unavailable" ? (
            <Alert>
              <AlertTitle>Performance data unavailable</AlertTitle>
              <AlertDescription>{performance.message}</AlertDescription>
            </Alert>
          ) : null}
          {performanceOk ? (
            performanceReady ? (
              <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                <PerformanceScatter videos={performance.videos} />
                <BestPostingDay weekdays={performance.weekdays} />
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                <Card>
                  <CardContent className="space-y-4 pt-6">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-4 w-40" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="space-y-4 pt-6">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              </div>
            )
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
