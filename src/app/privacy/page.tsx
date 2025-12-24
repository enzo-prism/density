import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <AppShell size="narrow">
      <PageHeader
        title="Privacy Policy"
        subtitle="This policy explains what information density.report accesses, how it is used, and what is stored."
      />

      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href="/">Back to home</Link>
      </Button>

      <Card>
        <CardContent className="space-y-6 pt-6 text-sm text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              YouTube API Services
            </h2>
            <p>
              density.report uses YouTube API Services to retrieve public channel and
              upload information. Only public uploads are counted.
            </p>
          </section>

          <Separator />

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

          <Separator />

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

          <Separator />

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
                className="font-semibold text-foreground underline underline-offset-4"
              >
                https://policies.google.com/privacy
              </a>
              .
            </p>
          </section>
        </CardContent>
      </Card>
    </AppShell>
  );
}
