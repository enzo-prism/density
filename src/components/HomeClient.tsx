"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import Heatmap from "@/components/Heatmap";
import PageHeader from "@/components/PageHeader";
import StatsCards from "@/components/StatsCards";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { clampLookbackDays } from "@/lib/dates";
import type { AnalyzeErrorResponse, AnalyzeResponse } from "@/lib/types";

const examples = [
  {
    label: "Prism",
    value: "https://www.youtube.com/@the_design_prism",
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
];
const privacyKey = "density_privacy_ack";
const suggestedTimezones = [
  "UTC",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];
const rangePresets = [
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last 180 days", value: 180 },
  { label: "Last 365 days", value: 365 },
  { label: "Last 2 years", value: 730 },
  { label: "Last 10 years", value: 3650 },
];

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
  const queryDays = searchParams.get("days");

  const [channelInput, setChannelInput] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [timezones, setTimezones] = useState(suggestedTimezones);
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [lookbackDays, setLookbackDays] = useState(365);
  const [rangeSelection, setRangeSelection] = useState("365");
  const [customDaysInput, setCustomDaysInput] = useState("365");
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
  }, [queryDays]);

  useEffect(() => {
    if (typeof Intl === "undefined") {
      return;
    }
    const supportedValuesOf = (Intl as typeof Intl & {
      supportedValuesOf?: (type: "timeZone") => string[];
    }).supportedValuesOf;
    if (!supportedValuesOf) {
      return;
    }
    try {
      const values = supportedValuesOf("timeZone");
      if (Array.isArray(values) && values.length > 0) {
        setTimezones(values);
      }
    } catch {
      // Ignore failures and keep fallback list.
    }
  }, []);

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
      lookbackOverride?: number
    ) => {
      const trimmedChannel = channelValue.trim();
      const trimmedTimezone = timezoneValue.trim();
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
          days: String(sanitizedLookback),
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
            lookbackDays: sanitizedLookback,
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
        setLookbackDays((data as AnalyzeResponse).lookbackDays);
        setCustomDaysInput(String((data as AnalyzeResponse).lookbackDays));
        const selection = rangePresets.some(
          (preset) => preset.value === (data as AnalyzeResponse).lookbackDays
        )
          ? String((data as AnalyzeResponse).lookbackDays)
          : "custom";
        setRangeSelection(selection);
      } catch {
        setError("Failed to reach the analyzer. Please try again.");
        setResult(null);
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [agreedToPrivacy, loading, lookbackDays, router]
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
    void analyze(queryChannel, queryTimezone, false, clampedDays);
  }, [
    queryChannel,
    queryTimezone,
    queryDays,
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
  const showSkeletons = loading;

  const timezoneOptions = timezones.includes(timezone)
    ? timezones
    : [timezone, ...timezones];
  const suggestedOptions = Array.from(
    new Set([timezone, ...suggestedTimezones])
  ).filter((zone) => timezoneOptions.includes(zone));
  const remainingOptions = timezoneOptions.filter(
    (zone) => !suggestedOptions.includes(zone)
  );
  const handleRangeChange = (value: string) => {
    setRangeSelection(value);
    if (value === "custom") {
      setCustomDaysInput(String(lookbackDays));
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
        title="Density"
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
      />

      <Card
        className="motion-safe:animate-[fade-up_0.6s_ease-out]"
        style={{ animationDelay: "80ms" }}
      >
        <CardContent className="px-4 sm:px-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleAnalyze();
            }}
            className="grid gap-5 sm:gap-6 md:grid-cols-[1.3fr_0.7fr]"
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
              <Label htmlFor="timezone">Timezone</Label>
              <Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="timezone"
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={timezoneOpen}
                    className="h-11 w-full justify-between font-normal"
                  >
                    <span className="line-clamp-1 text-left">
                      {timezone || "Select timezone"}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search timezone..." />
                    <CommandList>
                      <CommandEmpty>No timezone found.</CommandEmpty>
                      <CommandGroup heading="Suggested">
                        {suggestedOptions.map((zone) => (
                          <CommandItem
                            key={`tz-suggested-${zone}`}
                            value={zone}
                            onSelect={() => {
                              setTimezone(zone);
                              setTimezoneOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                timezone === zone ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {zone}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {remainingOptions.length > 0 ? <CommandSeparator /> : null}
                      {remainingOptions.length > 0 ? (
                        <CommandGroup heading="All timezones">
                          {remainingOptions.map((zone) => (
                            <CommandItem
                              key={`tz-${zone}`}
                              value={zone}
                              onSelect={() => {
                                setTimezone(zone);
                                setTimezoneOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  timezone === zone ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {zone}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : null}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="space-y-3">
                <Label htmlFor="range">Date range</Label>
                <Select value={rangeSelection} onValueChange={handleRangeChange}>
                  <SelectTrigger id="range" className="h-11">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {rangePresets.map((preset) => (
                      <SelectItem
                        key={`range-${preset.value}`}
                        value={String(preset.value)}
                      >
                        {preset.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
                {rangeSelection === "custom" ? (
                  <div className="space-y-2">
                    <Label htmlFor="custom-days" className="text-xs">
                      Custom days (30–3650)
                    </Label>
                    <Input
                      id="custom-days"
                      type="number"
                      inputMode="numeric"
                      min={30}
                      max={3650}
                      value={customDaysInput}
                      onChange={handleCustomDaysChange}
                      onBlur={handleCustomDaysBlur}
                      className="h-11"
                    />
                  </div>
                ) : null}
              </div>
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
                        <CardDescription>
                          {result.channel.handle}
                        </CardDescription>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {channelUrl ? (
                      <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                        <a href={channelUrl} target="_blank" rel="noreferrer">
                          View on YouTube
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={handleCopyShareLink}
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
                  <span>{result.lookbackDays} days</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{result.timezone}</span>
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
