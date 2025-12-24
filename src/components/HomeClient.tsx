"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { clampLookbackDays } from "@/lib/dates";
import type { AnalyzeErrorResponse, AnalyzeResponse } from "@/lib/types";

const examples = [
  {
    label: "Prism",
    value: "https://www.youtube.com/@the_design_prism",
  },
  {
    label: "TBPN",
    value: "https://www.youtube.com/@TBPNLive",
  },
  {
    label: "Joe Rogan",
    value: "https://www.youtube.com/@joerogan",
  },
  {
    label: "Alex Hormozi",
    value: "https://www.youtube.com/@AlexHormozi",
  },
  {
    label: "My First Million",
    value: "https://www.youtube.com/@MyFirstMillionPod",
  },
  {
    label: "This Week in Startups",
    value: "https://www.youtube.com/@startups",
  },
];
const privacyKey = "density_privacy_ack";
const rangePresets = [
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last 180 days", value: 180 },
  { label: "Last 365 days", value: 365 },
  { label: "Last 2 years", value: 730 },
  { label: "Last 10 years", value: 3650 },
];

const HomeAdvancedOptions = dynamic(() => import("./HomeAdvancedOptions"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-border p-4 text-xs text-muted-foreground">
      Loading advanced options...
    </div>
  ),
});

const HomeResults = dynamic(() => import("./HomeResults"), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  ),
});

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryChannel = searchParams.get("c");
  const queryTimezone = searchParams.get("tz");
  const queryDays = searchParams.get("days");
  const queryRange = searchParams.get("range");

  const [channelInput, setChannelInput] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [lookbackDays, setLookbackDays] = useState(365);
  const [rangeSelection, setRangeSelection] = useState("365");
  const [customDaysInput, setCustomDaysInput] = useState("365");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [resultRange, setResultRange] = useState<"days" | "lifetime">("days");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [privacyReady, setPrivacyReady] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
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
    if (queryRange === "lifetime" || queryDays === "lifetime") {
      setRangeSelection("lifetime");
      return;
    }
    if (!queryDays) {
      return;
    }
    const parsed = Number(queryDays);
    if (!Number.isFinite(parsed)) {
      return;
    }
    const clamped = clampLookbackDays(parsed);
    setLookbackDays(clamped);
    setCustomDaysInput(String(clamped));
    const isPreset = rangePresets.some((preset) => preset.value === clamped);
    setRangeSelection(isPreset ? String(clamped) : "custom");
  }, [queryDays, queryRange]);

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
    async (
      channelValue: string,
      timezoneValue: string,
      updateUrl = true,
      lookbackOverride?: number,
      rangeOverride?: "days" | "lifetime"
    ) => {
      const trimmedChannel = channelValue.trim();
      const trimmedTimezone = timezoneValue.trim();
      const resolvedRange =
        rangeOverride ?? (rangeSelection === "lifetime" ? "lifetime" : "days");
      const sanitizedLookback = clampLookbackDays(
        lookbackOverride ?? lookbackDays
      );
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
        if (resolvedRange === "lifetime") {
          params.set("range", "lifetime");
        } else {
          params.set("days", String(sanitizedLookback));
        }
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
            ...(resolvedRange === "lifetime"
              ? { range: "lifetime" }
              : { lookbackDays: sanitizedLookback }),
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
        if (resolvedRange === "lifetime") {
          setRangeSelection("lifetime");
          setResultRange("lifetime");
        } else {
          setResultRange("days");
          setLookbackDays((data as AnalyzeResponse).lookbackDays);
          setCustomDaysInput(String((data as AnalyzeResponse).lookbackDays));
          const selection = rangePresets.some(
            (preset) => preset.value === (data as AnalyzeResponse).lookbackDays
          )
            ? String((data as AnalyzeResponse).lookbackDays)
            : "custom";
          setRangeSelection(selection);
        }
      } catch {
        setError("Failed to reach the analyzer. Please try again.");
        setResult(null);
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [agreedToPrivacy, loading, lookbackDays, rangeSelection, router]
  );

  const handleAnalyze = useCallback(async () => {
    const rangeOverride = rangeSelection === "lifetime" ? "lifetime" : "days";
    await analyze(channelInput, timezone, true, undefined, rangeOverride);
  }, [analyze, channelInput, timezone, rangeSelection]);

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
    const isLifetimeQuery =
      queryRange === "lifetime" || queryDays === "lifetime";
    if (isLifetimeQuery) {
      setRangeSelection("lifetime");
      void analyze(queryChannel, queryTimezone, false, undefined, "lifetime");
      return;
    }
    const parsedDays = queryDays ? Number(queryDays) : NaN;
    let clampedDays = lookbackDays;
    if (Number.isFinite(parsedDays)) {
      clampedDays = clampLookbackDays(parsedDays);
      setLookbackDays(clampedDays);
      setCustomDaysInput(String(clampedDays));
      const selection = rangePresets.some((preset) => preset.value === clampedDays)
        ? String(clampedDays)
        : "custom";
      setRangeSelection(selection);
    }
    void analyze(queryChannel, queryTimezone, false, clampedDays, "days");
  }, [
    queryChannel,
    queryTimezone,
    queryDays,
    queryRange,
    privacyReady,
    agreedToPrivacy,
    analyze,
    lookbackDays,
  ]);

  const channelUrl = result
    ? result.channel.handle
      ? `https://www.youtube.com/${result.channel.handle}`
      : `https://www.youtube.com/channel/${result.channel.id}`
    : null;
  const showResults = Boolean(result) || loading;
  const handleRangeChange = (value: string) => {
    setRangeSelection(value);
    if (value === "custom") {
      setCustomDaysInput(String(lookbackDays));
      return;
    }
    if (value === "lifetime") {
      return;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return;
    }
    setLookbackDays(parsed);
    setCustomDaysInput(String(parsed));
  };

  const handleCustomDaysChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCustomDaysInput(value);
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      setLookbackDays(parsed);
    }
  };

  const handleCustomDaysBlur = () => {
    const parsed = Number(customDaysInput);
    if (!Number.isFinite(parsed)) {
      setCustomDaysInput(String(lookbackDays));
      return;
    }
    const clamped = clampLookbackDays(parsed);
    setLookbackDays(clamped);
    setCustomDaysInput(String(clamped));
    const selection = rangePresets.some((preset) => preset.value === clamped)
      ? String(clamped)
      : "custom";
    setRangeSelection(selection);
  };

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
        title="density.report"
        caption={
          <a
            href="https://design-prism.com"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            engineered by prism in silicon valley
          </a>
        }
        logoSrc="/Prism%20Logo.jpg"
      />

      <div
        className="mx-auto w-full max-w-2xl motion-safe:animate-[fade-up_0.6s_ease-out]"
        style={{ animationDelay: "80ms" }}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleAnalyze();
          }}
          className="grid gap-5 sm:gap-6"
        >
            <div className="space-y-3">
              <Label htmlFor="channel">
                Paste your YouTube channel link or handle
              </Label>
              <Input
                id="channel"
                value={channelInput}
                onChange={(event) => setChannelInput(event.target.value)}
                placeholder="URL or @handle"
                className="h-12 text-base"
              />
              <div className="flex flex-wrap gap-2">
                {examples.map((example) => (
                  <Button
                    key={example.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setChannelInput(example.value)}
                    className="rounded-full text-xs"
                  >
                    {example.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-state={advancedOpen ? "open" : "closed"}
                  aria-expanded={advancedOpen}
                  onClick={() => setAdvancedOpen((open) => !open)}
                  className="group gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Advanced options
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                </Button>
              </div>
              {advancedOpen ? (
                <HomeAdvancedOptions
                  timezone={timezone}
                  onTimezoneChange={setTimezone}
                  rangeSelection={rangeSelection}
                  onRangeChange={handleRangeChange}
                  rangePresets={rangePresets}
                  customDaysInput={customDaysInput}
                  onCustomDaysChange={handleCustomDaysChange}
                  onCustomDaysBlur={handleCustomDaysBlur}
                />
              ) : null}
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                size="lg"
                disabled={
                  loading || channelInput.trim().length === 0 || !agreedToPrivacy
                }
                className="w-full h-12 rounded-full text-sm sm:text-base font-semibold tracking-wide"
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
                    prefetch={false}
                    className="font-semibold text-foreground underline underline-offset-4"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </div>
        </form>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {showResults ? (
        <HomeResults
          result={result}
          loading={loading}
          resultRange={resultRange}
          channelUrl={channelUrl}
          onCopyShareLink={handleCopyShareLink}
        />
      ) : null}
    </AppShell>
  );
}
