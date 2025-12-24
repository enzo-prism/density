"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import Heatmap from "@/components/Heatmap";
import StatsCards from "@/components/StatsCards";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

      <div className="order-2 sm:order-3">
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
            />
          </TooltipProvider>
        ) : null}
      </div>

      <div className="order-3 sm:order-2">
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
    </section>
  );
}
