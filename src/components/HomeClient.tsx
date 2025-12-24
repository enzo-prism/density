"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import Heatmap from "@/components/Heatmap";
import PageHeader from "@/components/PageHeader";
import StatsCards from "@/components/StatsCards";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyzeErrorResponse, AnalyzeResponse } from "@/lib/types";

const examples = [
  "https://www.youtube.com/@veritasium",
  "@mkbhd",
  "https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA",
];
const privacyKey = "density_privacy_ack";

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

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryChannel = searchParams.get("c");
  const queryTimezone = searchParams.get("tz");

  const [channelInput, setChannelInput] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [privacyReady, setPrivacyReady] = useState(false);
  const autoRunRef = useRef(false);

  useEffect(() => {
    if (!queryTimezone) {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setTimezone(detected);
      }
    }
  }, [queryTimezone]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(privacyKey);
      if (stored === "true") {
        setAgreedToPrivacy(true);
      }
    } catch {
      // Ignore storage errors (e.g. blocked access).
    } finally {
      setPrivacyReady(true);
    }
  }, []);

  const handlePrivacyToggle = (checked: boolean) => {
    setAgreedToPrivacy(checked);
    try {
      window.localStorage.setItem(privacyKey, checked ? "true" : "false");
    } catch {
      // Ignore storage errors (e.g. blocked access).
    }
  };

  const analyze = useCallback(
    async (channelValue: string, timezoneValue: string, updateUrl = true) => {
      const trimmedChannel = channelValue.trim();
      const trimmedTimezone = timezoneValue.trim();
      if (!trimmedChannel) {
        setError("Channel input is required.");
        return;
      }
      if (!agreedToPrivacy) {
        setError("Please agree to the Privacy Policy to continue.");
        return;
      }
      if (loading) {
        return;
      }
      if (updateUrl) {
        const params = new URLSearchParams({
          c: trimmedChannel,
          tz: trimmedTimezone,
        });
        router.replace(`/?${params.toString()}`);
      }
      setLoading(true);
      setError(null);
      setChannelInput(trimmedChannel);
      setTimezone(trimmedTimezone);
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel: trimmedChannel,
            timezone: trimmedTimezone,
          }),
        });

        const data = (await response.json()) as
          | AnalyzeResponse
          | AnalyzeErrorResponse;

        if (!response.ok) {
          const message =
            "error" in data ? data.error.message : "Unknown error.";
          setError(message);
          setResult(null);
          return;
        }

        setResult(data as AnalyzeResponse);
        setTimezone((data as AnalyzeResponse).timezone);
      } catch {
        setError("Failed to reach the analyzer. Please try again.");
        setResult(null);
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [agreedToPrivacy, loading, router]
  );

  const handleAnalyze = useCallback(async () => {
    await analyze(channelInput, timezone, true);
  }, [analyze, channelInput, timezone]);

  useEffect(() => {
    if (autoRunRef.current) {
      return;
    }
    if (!queryChannel || !queryTimezone) {
      return;
    }
    if (!privacyReady || !agreedToPrivacy) {
      return;
    }
    autoRunRef.current = true;
    setChannelInput(queryChannel);
    setTimezone(queryTimezone);
    void analyze(queryChannel, queryTimezone, false);
  }, [queryChannel, queryTimezone, privacyReady, agreedToPrivacy, analyze]);

  const channelUrl = result
    ? result.channel.handle
      ? `https://www.youtube.com/${result.channel.handle}`
      : `https://www.youtube.com/channel/${result.channel.id}`
    : null;
  const showResults = Boolean(result) || loading;
  const showSkeletons = loading;

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Copied share link");
    } catch {
      toast.error("Unable to copy share link");
    }
  };

  return (
    <AppShell footerChannelUrl={channelUrl ?? undefined}>
      <PageHeader
        title="Density"
        subtitle="Posting frequency tracker for YouTube channels. Paste a channel link or handle to map every posting day over the last year, then spot streaks and gaps instantly."
      />

      <Card
        className="motion-safe:animate-[fade-up_0.6s_ease-out]"
        style={{ animationDelay: "80ms" }}
      >
        <CardHeader>
          <CardTitle className="text-lg">Analyze a channel</CardTitle>
          <CardDescription>
            Enter a channel handle or ID and choose the timezone for local
            dates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleAnalyze();
            }}
            className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]"
          >
            <div className="space-y-3">
              <Label htmlFor="channel">
                Paste your YouTube channel link or handle
              </Label>
              <Input
                id="channel"
                value={channelInput}
                onChange={(event) => setChannelInput(event.target.value)}
                placeholder="https://www.youtube.com/@handle or @handle"
                className="h-11"
              />
              <div className="flex flex-wrap gap-2">
                {examples.map((example) => (
                  <Button
                    key={example}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setChannelInput(example)}
                    className="rounded-full text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                placeholder="America/Los_Angeles"
                className="h-11"
              />
              <Button
                type="submit"
                size="lg"
                disabled={
                  loading || channelInput.trim().length === 0 || !agreedToPrivacy
                }
                className="w-full uppercase tracking-[0.2em]"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="privacy"
                  checked={agreedToPrivacy}
                  onCheckedChange={(value) =>
                    handlePrivacyToggle(value === true)
                  }
                />
                <Label
                  htmlFor="privacy"
                  className="text-xs text-muted-foreground"
                >
                  I agree to the{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-foreground underline underline-offset-4"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                We use your local timezone by default. Edit if needed.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {showResults ? (
        <section
          className="space-y-6 motion-safe:animate-[fade-up_0.6s_ease-out]"
          style={{ animationDelay: "140ms" }}
        >
          {showSkeletons ? (
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-36" />
                  </div>
                </div>
                <Separator />
                <Skeleton className="h-4 w-72" />
              </CardContent>
            </Card>
          ) : result ? (
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage
                        src={result.channel.thumbnailUrl}
                        alt={`${result.channel.title} thumbnail`}
                      />
                      <AvatarFallback>
                        {getInitials(result.channel.title)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {result.channel.title}
                      </CardTitle>
                      {result.channel.handle ? (
                        <CardDescription>
                          {result.channel.handle}
                        </CardDescription>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {channelUrl ? (
                      <Button asChild variant="outline" size="sm">
                        <a href={channelUrl} target="_blank" rel="noreferrer">
                          View on YouTube
                        </a>
                      </Button>
                    ) : null}
                    <Button variant="secondary" size="sm" onClick={handleCopyShareLink}>
                      Copy share link
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  {result.startDate} → {result.endDate} · {result.lookbackDays}{" "}
                  days · {result.timezone}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {showSkeletons ? (
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`stat-skel-${index}`} className="h-28 w-full" />
              ))}
            </div>
          ) : result ? (
            <StatsCards stats={result.stats} />
          ) : null}

          {showSkeletons ? (
            <Card>
              <CardContent className="space-y-4 pt-6">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ) : result ? (
            <Heatmap
              startDate={result.startDate}
              endDate={result.endDate}
              days={result.days}
            />
          ) : null}
        </section>
      ) : null}
    </AppShell>
  );
}
