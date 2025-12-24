"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Heatmap from "@/components/Heatmap";
import StatsCards from "@/components/StatsCards";
import type { AnalyzeErrorResponse, AnalyzeResponse } from "@/lib/types";

const examples = [
  "https://www.youtube.com/@veritasium",
  "@mkbhd",
  "https://www.youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA",
];

export default function Home() {
  const [channelInput, setChannelInput] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) {
      setTimezone(detected);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!channelInput.trim()) {
      setError("Channel input is required.");
      return;
    }
    if (loading) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: channelInput,
          timezone,
        }),
      });

      const data = (await response.json()) as
        | AnalyzeResponse
        | AnalyzeErrorResponse;

      if (!response.ok) {
        const message = "error" in data ? data.error.message : "Unknown error.";
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
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),transparent_45%),radial-gradient(circle_at_bottom,_rgba(245,158,11,0.16),transparent_55%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12 md:py-16">
        <header className="flex flex-col gap-6 motion-safe:animate-[fade-up_0.6s_ease-out]">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            YouTube Posting Frequency Tracker
          </div>
          <div className="max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
            See when a channel actually posts, not just how many views it gets.
          </div>
          <p className="max-w-2xl text-base text-slate-600 md:text-lg">
            Paste a YouTube channel link or handle to map every posting day over
            the last year, then spot streaks and gaps instantly.
          </p>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleAnalyze();
          }}
          className="mt-10 grid gap-6 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur motion-safe:animate-[fade-up_0.6s_ease-out] md:grid-cols-[1.3fr_0.7fr]"
          style={{ animationDelay: "80ms" }}
        >
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Paste your YouTube channel link or handle
            </label>
            <input
              value={channelInput}
              onChange={(event) => setChannelInput(event.target.value)}
              placeholder="https://www.youtube.com/@handle or @handle"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm outline-none ring-0 transition focus:border-slate-400"
            />
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setChannelInput(example)}
                  className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 hover:border-slate-300"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Timezone
            </label>
            <input
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              placeholder="America/Los_Angeles"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm outline-none ring-0 transition focus:border-slate-400"
            />
            <button
              type="submit"
              disabled={loading || channelInput.trim().length === 0}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
            <div className="text-xs text-slate-500">
              We use your local timezone by default. Edit if needed.
            </div>
          </div>
        </form>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {result ? (
          <section
            className="mt-10 space-y-6 motion-safe:animate-[fade-up_0.6s_ease-out]"
            style={{ animationDelay: "140ms" }}
          >
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {result.channel.thumbnailUrl ? (
                  <Image
                    src={result.channel.thumbnailUrl}
                    alt={`${result.channel.title} thumbnail`}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-slate-200" />
                )}
                <div>
                  <div className="text-xl font-semibold text-slate-900">
                    {result.channel.title}
                  </div>
                  {result.channel.handle ? (
                    <div className="text-sm text-slate-500">
                      {result.channel.handle}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="text-sm text-slate-500">
                {result.startDate} → {result.endDate} · {result.lookbackDays} days
                · {result.timezone}
              </div>
            </div>

            <StatsCards stats={result.stats} />
            <Heatmap
              startDate={result.startDate}
              endDate={result.endDate}
              days={result.days}
            />
          </section>
        ) : null}

        <footer className="mt-auto pt-10 text-xs text-slate-500">
          Only public uploads are counted.
        </footer>
      </div>
    </div>
  );
}
