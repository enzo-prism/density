import { NextResponse } from "next/server";
import {
  clampLookbackDays,
  getDateRangeInTimeZone,
  isValidTimeZone,
} from "@/lib/dates";
import { computeStreakStats } from "@/lib/streaks";
import {
  ChannelNotFoundError,
  YouTubeApiError,
  fetchUploadCounts,
  parseChannelInput,
  resolveChannel,
} from "@/lib/youtube";
import type { AnalyzeErrorResponse, AnalyzeResponse } from "@/lib/types";

const CACHE_TTL_MS = 10 * 60 * 1000;
const responseCache = new Map<
  string,
  { expiresAt: number; data: AnalyzeResponse }
>();

function jsonError(status: number, code: string, message: string) {
  const payload: AnalyzeErrorResponse = { error: { code, message } };
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      channel?: string;
      timezone?: string;
      lookbackDays?: number;
    };

    const channelInput = typeof body.channel === "string" ? body.channel : "";
    const timezone =
      typeof body.timezone === "string" ? body.timezone.trim() : "";
    const lookbackDays = clampLookbackDays(
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

    const resolved = await resolveChannel(parsed.data, apiKey);
    const cacheKey = `${resolved.channel.id}:${timezone}:${lookbackDays}`;
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const { startDate, endDate, startDayIndex, endDayIndex } =
      getDateRangeInTimeZone(timezone, lookbackDays);

    const days = await fetchUploadCounts({
      playlistId: resolved.uploadsPlaylistId,
      timeZone: timezone,
      startDayIndex,
      endDayIndex,
      apiKey,
    });

    const stats = computeStreakStats(days, endDate);

    const response: AnalyzeResponse = {
      channel: resolved.channel,
      timezone,
      lookbackDays,
      startDate,
      endDate,
      days,
      stats,
    };

    responseCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data: response,
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ChannelNotFoundError) {
      return jsonError(404, "channel_not_found", error.message);
    }

    if (error instanceof YouTubeApiError) {
      const isQuota = error.status === 403 || error.status === 429;
      return jsonError(
        502,
        "youtube_api_error",
        isQuota
          ? "YouTube API request was rejected (quota or access). Try again later."
          : `YouTube API request failed: ${error.message}`
      );
    }

    return jsonError(500, "unknown_error", "Unexpected server error.");
  }
}
