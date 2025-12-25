import { dateToDayIndex, formatDateInTimeZone } from "@/lib/dates";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export type ChannelLookup =
  | { kind: "id"; value: string }
  | { kind: "handle"; value: string };

export type ChannelInfo = {
  id: string;
  title: string;
  thumbnailUrl: string;
  handle?: string;
};

export type ResolvedChannel = {
  channel: ChannelInfo;
  uploadsPlaylistId: string;
  createdAt?: string;
};

export type ChannelParseResult =
  | { ok: true; data: ChannelLookup }
  | { ok: false; message: string };

export type Upload = {
  videoId: string;
  publishedAt: string;
  localDate: string;
  dayIndex: number;
};

export type RankedUpload = {
  videoId: string;
  publishedAt: string;
  localDate: string;
  dayIndex: number;
};

export type VideoPerformance = {
  title: string;
  views: number;
  likes: number;
  comments: number;
  durationSeconds: number;
};

export class ChannelNotFoundError extends Error {}

export class YouTubeTimeoutError extends Error {}

export class YouTubeApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type ChannelListResponse = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      customUrl?: string;
      publishedAt?: string;
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type PlaylistItemsResponse = {
  items?: Array<{
    contentDetails?: {
      videoId?: string;
      videoPublishedAt?: string;
    };
  }>;
  nextPageToken?: string;
};

type VideosListResponse = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
    };
    statistics?: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
    contentDetails?: {
      duration?: string;
    };
  }>;
};

export function parseChannelInput(input: string): ChannelParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      ok: false,
      message:
        "Paste a channel link or handle in one of the supported formats.",
    };
  }

  const handleMatch = trimmed.match(/^@([A-Za-z0-9._-]+)(?:[/?#].*)?$/);
  if (handleMatch) {
    return {
      ok: true,
      data: { kind: "handle", value: handleMatch[1] },
    };
  }

  const withScheme = (() => {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (
      trimmed.startsWith("www.youtube.com/") ||
      trimmed.startsWith("youtube.com/") ||
      trimmed.startsWith("m.youtube.com/")
    ) {
      return `https://${trimmed}`;
    }
    return null;
  })();

  if (withScheme) {
    try {
      const url = new URL(withScheme);
      const host = url.hostname.toLowerCase();
      if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
        const handlePathMatch = url.pathname.match(
          /^\/@([A-Za-z0-9._-]+)(?:\/|$)/
        );
        if (handlePathMatch) {
          return {
            ok: true,
            data: { kind: "handle", value: handlePathMatch[1] },
          };
        }

        const channelIdMatch = url.pathname.match(
          /^\/channel\/(UC[a-zA-Z0-9_-]{22})(?:\/|$)/
        );
        if (channelIdMatch) {
          return { ok: true, data: { kind: "id", value: channelIdMatch[1] } };
        }
      }
    } catch {
      // fall through to error below
    }
  }

  return {
    ok: false,
    message:
      "Only these formats are supported: https://www.youtube.com/@handle, @handle, or https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx",
  };
}

const YOUTUBE_REQUEST_TIMEOUT_MS = 6_000;

function combineSignals(signals: AbortSignal[]): AbortSignal {
  if (signals.length === 1) {
    return signals[0];
  }
  const anySignal = (
    AbortSignal as typeof AbortSignal & {
      any?: (signals: AbortSignal[]) => AbortSignal;
    }
  ).any;
  if (anySignal) {
    return anySignal(signals);
  }
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller.signal;
}

async function youtubeGet<T>(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string,
  signal?: AbortSignal
): Promise<T> {
  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);
  const search = new URLSearchParams({ ...params, key: apiKey });
  url.search = search.toString();

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    YOUTUBE_REQUEST_TIMEOUT_MS
  );
  const fetchSignal = signal
    ? combineSignals([signal, timeoutController.signal])
    : timeoutController.signal;

  let response: Response;
  try {
    response = await fetch(url.toString(), { method: "GET", signal: fetchSignal });
  } catch (error) {
    if (fetchSignal.aborted) {
      throw new YouTubeTimeoutError("YouTube API request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
  if (!response.ok) {
    let message = "YouTube API request failed.";
    try {
      const data = (await response.json()) as { error?: { message?: string } };
      if (data?.error?.message) {
        message = data.error.message;
      }
    } catch {
      // Ignore JSON parse errors and use fallback message.
    }
    throw new YouTubeApiError(response.status, message);
  }
  return (await response.json()) as T;
}

export async function resolveChannel(
  lookup: ChannelLookup,
  apiKey: string,
  signal?: AbortSignal
): Promise<ResolvedChannel> {
  const params: Record<string, string> = {
    part: "snippet,contentDetails",
    fields:
      "items(id,snippet(title,customUrl,publishedAt,thumbnails(high(url),medium(url),default(url))),contentDetails(relatedPlaylists(uploads)))",
  };
  if (lookup.kind === "id") {
    params.id = lookup.value;
  } else {
    params.forHandle = lookup.value;
  }

  const data = await youtubeGet<ChannelListResponse>(
    "channels",
    params,
    apiKey,
    signal
  );
  const item = data.items?.[0];

  if (!item?.id) {
    throw new ChannelNotFoundError("Channel not found.");
  }

  const snippet = item.snippet;
  const thumbnails = snippet?.thumbnails;
  const thumbnailUrl =
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    "";

  const uploadsPlaylistId =
    item.contentDetails?.relatedPlaylists?.uploads ?? "";

  if (!uploadsPlaylistId) {
    throw new ChannelNotFoundError("Uploads playlist not available.");
  }

  const handle = snippet?.customUrl;
  const createdAt = snippet?.publishedAt;

  return {
    channel: {
      id: item.id,
      title: snippet?.title ?? "Untitled Channel",
      thumbnailUrl,
      handle: handle?.startsWith("@") ? handle : undefined,
    },
    uploadsPlaylistId,
    createdAt,
  };
}

export function parseIsoDurationToSeconds(duration: string): number {
  if (!duration) {
    return 0;
  }
  const match = duration.match(
    /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/
  );
  if (!match) {
    return 0;
  }
  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);
  if (
    Number.isNaN(days) ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds)
  ) {
    return 0;
  }
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

export async function fetchUploadCounts(options: {
  playlistId: string;
  timeZone: string;
  startDayIndex: number;
  endDayIndex: number;
  rankStartDayIndex?: number;
  rankEndDayIndex?: number;
  rankCap?: number;
  apiKey: string;
  signal?: AbortSignal;
  deadlineMs?: number;
}): Promise<{ counts: Record<string, number>; uploads: Upload[]; rankedUploads: RankedUpload[] }> {
  const {
    playlistId,
    timeZone,
    startDayIndex,
    endDayIndex,
    rankStartDayIndex,
    rankEndDayIndex,
    rankCap = 500,
    apiKey,
    signal,
    deadlineMs,
  } = options;
  const counts: Record<string, number> = {};
  const uploads: Upload[] = [];
  const rankedUploads: RankedUpload[] = [];
  const scanUntilDayIndex =
    rankStartDayIndex !== undefined
      ? Math.min(startDayIndex, rankStartDayIndex)
      : startDayIndex;

  let pageToken: string | undefined;
  let shouldContinue = true;

  while (shouldContinue) {
    if (deadlineMs && Date.now() > deadlineMs) {
      throw new YouTubeTimeoutError("Total processing time exceeded.");
    }
    const params: Record<string, string> = {
      part: "contentDetails",
      playlistId,
      maxResults: "50",
      fields: "items(contentDetails(videoId,videoPublishedAt)),nextPageToken",
    };
    if (pageToken) {
      params.pageToken = pageToken;
    }

    const data = await youtubeGet<PlaylistItemsResponse>(
      "playlistItems",
      params,
      apiKey,
      signal
    );

    let oldestDayIndex = Number.POSITIVE_INFINITY;

    for (const item of data.items ?? []) {
      const contentDetails = item.contentDetails;
      const publishedAt = contentDetails?.videoPublishedAt;
      const videoId = contentDetails?.videoId;
      if (!publishedAt || !videoId) {
        continue;
      }
      const publishedDate = new Date(publishedAt);
      if (Number.isNaN(publishedDate.getTime())) {
        continue;
      }
      const dateString = formatDateInTimeZone(publishedDate, timeZone);
      const dayIndex = dateToDayIndex(dateString);
      if (dayIndex < oldestDayIndex) {
        oldestDayIndex = dayIndex;
      }
      if (dayIndex < startDayIndex || dayIndex > endDayIndex) {
        continue;
      }
      counts[dateString] = (counts[dateString] ?? 0) + 1;
      uploads.push({
        videoId,
        publishedAt,
        localDate: dateString,
        dayIndex,
      });
      if (
        rankStartDayIndex !== undefined &&
        dayIndex >= rankStartDayIndex &&
        dayIndex <= (rankEndDayIndex ?? endDayIndex) &&
        rankedUploads.length < rankCap
      ) {
        rankedUploads.push({
          videoId,
          publishedAt,
          localDate: dateString,
          dayIndex,
        });
      }
    }

    pageToken = data.nextPageToken;

    if (!pageToken) {
      shouldContinue = false;
    } else if (oldestDayIndex !== Number.POSITIVE_INFINITY) {
      if (oldestDayIndex < scanUntilDayIndex) {
        shouldContinue = false;
      }
    }
  }

  return { counts, uploads, rankedUploads };
}

export async function fetchVideoStats(
  videoIds: string[],
  apiKey: string,
  signal?: AbortSignal,
  deadlineMs?: number
): Promise<Map<string, { views: number; likes: number; comments: number }>> {
  const result = new Map<string, { views: number; likes: number; comments: number }>();
  if (videoIds.length === 0) {
    return result;
  }
  const chunkSize = 50;
  const chunks: string[][] = [];
  for (let i = 0; i < videoIds.length; i += chunkSize) {
    chunks.push(videoIds.slice(i, i + chunkSize));
  }
  let index = 0;
  const concurrency = Math.min(4, chunks.length);

  const worker = async () => {
    while (index < chunks.length) {
      const currentIndex = index;
      index += 1;
      if (deadlineMs && Date.now() > deadlineMs) {
        throw new YouTubeTimeoutError("Total processing time exceeded.");
      }
      const chunk = chunks[currentIndex] ?? [];
      if (chunk.length === 0) {
        continue;
      }
      const data = await youtubeGet<VideosListResponse>(
        "videos",
        {
          part: "statistics",
          id: chunk.join(","),
          maxResults: "50",
          fields: "items(id,statistics(viewCount,likeCount,commentCount))",
        },
        apiKey,
        signal
      );
      for (const item of data.items ?? []) {
        if (!item?.id) {
          continue;
        }
        const views = Number(item.statistics?.viewCount ?? 0);
        const likes = Number(item.statistics?.likeCount ?? 0);
        const comments = Number(item.statistics?.commentCount ?? 0);
        result.set(item.id, {
          views: Number.isFinite(views) ? views : 0,
          likes: Number.isFinite(likes) ? likes : 0,
          comments: Number.isFinite(comments) ? comments : 0,
        });
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return result;
}

export async function fetchVideoPerformance(
  videoIds: string[],
  apiKey: string,
  signal?: AbortSignal,
  deadlineMs?: number
): Promise<Record<string, VideoPerformance>> {
  const result: Record<string, VideoPerformance> = {};
  if (videoIds.length === 0) {
    return result;
  }
  const chunkSize = 50;
  const chunks: string[][] = [];
  for (let i = 0; i < videoIds.length; i += chunkSize) {
    chunks.push(videoIds.slice(i, i + chunkSize));
  }
  let index = 0;
  const concurrency = Math.min(4, chunks.length);

  const worker = async () => {
    while (index < chunks.length) {
      const currentIndex = index;
      index += 1;
      if (deadlineMs && Date.now() > deadlineMs) {
        throw new YouTubeTimeoutError("Total processing time exceeded.");
      }
      const chunk = chunks[currentIndex] ?? [];
      if (chunk.length === 0) {
        continue;
      }
      const data = await youtubeGet<VideosListResponse>(
        "videos",
        {
          part: "statistics,contentDetails,snippet",
          id: chunk.join(","),
          maxResults: "50",
          fields:
            "items(id,snippet(title),statistics(viewCount,likeCount,commentCount),contentDetails(duration))",
        },
        apiKey,
        signal
      );
      for (const item of data.items ?? []) {
        if (!item?.id) {
          continue;
        }
        const views = Number(item.statistics?.viewCount ?? 0);
        const likes = Number(item.statistics?.likeCount ?? 0);
        const comments = Number(item.statistics?.commentCount ?? 0);
        result[item.id] = {
          title: item.snippet?.title ?? "Untitled video",
          views: Number.isFinite(views) ? views : 0,
          likes: Number.isFinite(likes) ? likes : 0,
          comments: Number.isFinite(comments) ? comments : 0,
          durationSeconds: parseIsoDurationToSeconds(
            item.contentDetails?.duration ?? ""
          ),
        };
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return result;
}
