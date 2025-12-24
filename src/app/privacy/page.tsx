import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-12 md:py-16">
        <header className="space-y-4">
          <Badge
            variant="secondary"
            className="w-fit text-xs font-semibold uppercase tracking-[0.25em]"
          >
            Density
          </Badge>
          <h1 className="text-4xl font-semibold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            This policy explains what information Density accesses, how it is
            used, and what is stored.
          </p>
        </header>

        <main className="mt-8 space-y-6 text-sm text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              YouTube API Services
            </h2>
            <p>
              Density uses YouTube API Services to retrieve public channel and
              upload information. Only public uploads are counted.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              Information we access
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Channel identifiers or handles you provide in the analyzer input.
              </li>
              <li>Your timezone string to calculate local posting dates.</li>
              <li>
                Public metadata returned by the YouTube API (channel title,
                thumbnails, and video publish timestamps).
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              How we use and store data
            </h2>
            <p>
              The data is used to calculate posting counts, heatmaps, and streak
              statistics. We do not store personal information. Results are kept
              in an in-memory cache for up to 10 minutes to reduce API calls and
              then discarded.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              Google Privacy Policy
            </h2>
            <p>
              Learn more about how Google handles data at{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                https://policies.google.com/privacy
              </a>
              .
            </p>
          </section>
        </main>

        <Footer className="mt-auto" />
      </div>
    </div>
  );
}
