"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import Heatmap from "@/components/Heatmap";
import StatsCards from "@/components/StatsCards";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AnalyzeErrorResponse, AnalyzeResponse } from "@/lib/types";

const examples = [
  "https://www.youtube.com/@veritasium",
  "@mkbhd",
  "https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA",
];
const privacyKey = "density_privacy_ack";

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12 md:py-16">
        <header className="flex flex-col gap-4 motion-safe:animate-[fade-up_0.6s_ease-out]">
          <Badge
            variant="secondary"
            className="w-fit text-xs font-semibold uppercase tracking-[0.25em]"
          >
            Density
          </Badge>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
            Density
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            Posting frequency tracker for YouTube channels. Paste a channel link
            or handle to map every posting day over the last year, then spot
            streaks and gaps instantly.
          </p>
        </header>

        <Card
          className="mt-10 motion-safe:animate-[fade-up_0.6s_ease-out]"
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
                    loading ||
                    channelInput.trim().length === 0 ||
                    !agreedToPrivacy
                  }
                  className="w-full uppercase tracking-[0.2em]"
                >
                  {loading ? "Analyzing..." : "Analyze"}
                </Button>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={agreedToPrivacy}
                    onChange={(event) =>
                      handlePrivacyToggle(event.target.checked)
                    }
                    className="h-4 w-4 rounded border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold text-foreground underline underline-offset-4"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                <p className="text-xs text-muted-foreground">
                  We use your local timezone by default. Edit if needed.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {error ? (
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {result ? (
          <section
            className="mt-10 space-y-6 motion-safe:animate-[fade-up_0.6s_ease-out]"
            style={{ animationDelay: "140ms" }}
          >
            <Card>
              <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  {result.channel.thumbnailUrl ? (
                    <Image
                      src={result.channel.thumbnailUrl}
                      alt={`${result.channel.title} thumbnail`}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-muted" />
                  )}
                  <div>
                    <CardTitle className="text-xl">
                      {result.channel.title}
                    </CardTitle>
                    {result.channel.handle ? (
                      <CardDescription>{result.channel.handle}</CardDescription>
                    ) : null}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {result.startDate} → {result.endDate} · {result.lookbackDays}{" "}
                  days · {result.timezone}
                </div>
              </CardContent>
            </Card>

            <StatsCards stats={result.stats} />
            <Heatmap
              startDate={result.startDate}
              endDate={result.endDate}
              days={result.days}
            />
          </section>
        ) : null}

        <Footer
          className="mt-auto"
          channelUrl={
            result
              ? result.channel.handle
                ? `https://www.youtube.com/${result.channel.handle}`
                : `https://www.youtube.com/channel/${result.channel.id}`
              : undefined
          }
        />
      </div>
    </div>
  );
}
