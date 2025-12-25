# density.report

A lightweight MVP that maps a channel's posting cadence over the last 365 days.
Posting frequency tracker for YouTube channels that turns uploads into a
calendar heatmap and streak stats.

## API setup

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Enable **YouTube Data API v3** for the project.
4. Create an API key in **APIs & Services → Credentials**.
5. (Recommended) Restrict the key to YouTube Data API v3.

## Environment variables

```bash
cp .env.example .env.local
```

Set your API key:

```bash
YOUTUBE_API_KEY=your_api_key_here
```

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Notes

- Only public uploads are counted.
- The app never exposes your API key to the client; all YouTube requests stay on
  the server.
- Performance overlay uses public video statistics via `videos.list` (no OAuth).
- Like/comment counts may be missing or zero depending on video settings.
- Large channels can take longer to analyze due to extra API calls.
- Density Rank is a custom score based on public data and is not affiliated with YouTube.
- Performance stats for Density Rank may be temporarily unavailable due to quota/timeouts.
