import { NextResponse } from "next/server";
import {
  clampLookbackDays,
  formatDateInTimeZone,
  getDateRangeFromStartDate,
  getDateRangeInTimeZone,
  isValidTimeZone,
} from "@/lib/dates";
import { computeStreakStats } from "@/lib/streaks";
import {
  ChannelNotFoundError,
  YouTubeApiError,
  YouTubeTimeoutError,
  fetchUploadCounts,
  parseChannelInput,
  resolveChannel,
} from "@/lib/youtube";
import type { AnalyzeErrorResponse, AnalyzeResponse } from "@/lib/types";

const CACHE_TTL_MS = 10 * 60 * 1000;
const TOTAL_TIMEOUT_MS = 10 * 1000;
const responseCache = new Map<
  string,
  { expiresAt: number; data: AnalyzeResponse }
>();
const inFlightRequests = new Map<string, Promise<AnalyzeResponse>>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const rateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();
class ChannelCreationDateError extends Error {}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  return "unknown";
}

function checkRateLimit(request: Request) {
  const ip = getClientIp(request);
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfterMs: Math.max(0, entry.resetAt - now),
    };
  }

  entry.count += 1;
  return { allowed: true };
}

function jsonError(status: number, code: string, message: string) {
  const payload: AnalyzeErrorResponse = { error: { code, message } };
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let controller: AbortController | null = null;

  try {
    const rateLimit = checkRateLimit(request);
    if (!rateLimit.allowed) {
      return jsonError(
        429,
        "rate_limited",
        "Too many requests. Please wait a minute and try again."
      );
    }

    const body = (await request.json()) as {
      channel?: string;
      timezone?: string;
      lookbackDays?: number;
      range?: string;
    };

    const channelInput = typeof body.channel === "string" ? body.channel : "";
    const timezone =
      typeof body.timezone === "string" ? body.timezone.trim() : "";
    const range = body.range === "lifetime" ? "lifetime" : "days";
    const lookbackDays =
      range === "lifetime"
        ? undefined
        : clampLookbackDays(
            typeof body.lookbackDays === "number" ? body.lookbackDays : undefined
          );

    if (!channelInput.trim()) {
      return jsonError(400, "invalid_channel", "Channel input is required.");
    }

    if (!timezone || !isValidTimeZone(timezone)) {
      return jsonError(
        400,
        "invalid_timezone",
        "Provide a valid IANA timezone, like America/New_York."
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return jsonError(
        500,
        "missing_api_key",
        "Server misconfigured: missing YOUTUBE_API_KEY."
      );
    }

    const parsed = parseChannelInput(channelInput);
    if (!parsed.ok) {
      return jsonError(400, "invalid_channel", parsed.message);
    }

    controller = new AbortController();
    const signal = controller.signal;
    const deadlineMs = Date.now() + TOTAL_TIMEOUT_MS;
    timeoutId = setTimeout(() => controller?.abort(), TOTAL_TIMEOUT_MS);

    const resolved = await resolveChannel(parsed.data, apiKey, signal);
    const cacheKey = `${resolved.channel.id}:${timezone}:${
      range === "lifetime" ? "lifetime" : lookbackDays
    }`;
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      return NextResponse.json(cached.data);
    }

    const existing = inFlightRequests.get(cacheKey);
    if (existing) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const response = await existing;
      return NextResponse.json(response);
    }

    const analysisPromise = (async () => {
      let startDate: string;
      let endDate: string;
      let startDayIndex: number;
      let endDayIndex: number;
      let resolvedLookbackDays: number;

      if (range === "lifetime") {
        const createdAt = resolved.createdAt;
        if (!createdAt) {
          throw new ChannelCreationDateError(
            "Channel creation date not available."
          );
        }
        const createdAtDate = new Date(createdAt);
        if (Number.isNaN(createdAtDate.getTime())) {
          throw new ChannelCreationDateError(
            "Channel creation date not available."
          );
        }
        const createdDate = formatDateInTimeZone(createdAtDate, timezone);
        ({
          startDate,
          endDate,
          startDayIndex,
          endDayIndex,
          lookbackDays: resolvedLookbackDays,
        } = getDateRangeFromStartDate(timezone, createdDate));
      } else {
        ({
          startDate,
          endDate,
          startDayIndex,
          endDayIndex,
        } = getDateRangeInTimeZone(timezone, lookbackDays ?? 365));
        resolvedLookbackDays = lookbackDays ?? 365;
      }

      const days = await fetchUploadCounts({
        playlistId: resolved.uploadsPlaylistId,
        timeZone: timezone,
        startDayIndex,
        endDayIndex,
        apiKey,
        signal,
        deadlineMs,
      });

      const stats = computeStreakStats(days, endDate);

      const response: AnalyzeResponse = {
        channel: resolved.channel,
        timezone,
        lookbackDays: resolvedLookbackDays,
        startDate,
        endDate,
        days,
        stats,
      };

      responseCache.set(cacheKey, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        data: response,
      });

      return response;
    })();

    inFlightRequests.set(cacheKey, analysisPromise);

    try {
      const response = await analysisPromise;
      return NextResponse.json(response);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      inFlightRequests.delete(cacheKey);
    }
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (error instanceof ChannelNotFoundError) {
      return jsonError(404, "channel_not_found", error.message);
    }

    if (error instanceof ChannelCreationDateError) {
      return jsonError(
        502,
        "lifetime_unavailable",
        "Unable to determine the channel creation date."
      );
    }

    if (error instanceof YouTubeTimeoutError) {
      return jsonError(
        504,
        "temporary_failure",
        "Temporary failure. Please try again."
      );
    }

    if (error instanceof YouTubeApiError) {
      const isQuota = error.status === 403 || error.status === 429;
      return jsonError(
        503,
        isQuota ? "quota_exceeded" : "try_again",
        isQuota
          ? "Quota exceeded. Please try again later."
          : "Try again. YouTube API request failed."
      );
    }

    return jsonError(
      500,
      "temporary_failure",
      "Temporary failure. Please try again."
    );
  }
}
