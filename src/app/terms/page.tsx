import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function TermsPage() {
  return (
    <AppShell size="narrow">
      <PageHeader
        title="Terms"
        subtitle="By using Density, you agree to be bound by YouTube&apos;s Terms of Service."
      />

      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href="/">Back to home</Link>
      </Button>

      <Card>
        <CardContent className="space-y-6 pt-6 text-sm text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              Service overview
            </h2>
            <p>
              Density provides posting-frequency insights for public YouTube
              channels by analyzing public metadata from YouTube API Services.
            </p>
          </section>

          <Separator />

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              Acceptable use
            </h2>
            <p>
              You agree to use the service for lawful purposes and not to misuse
              or attempt to disrupt the service or its underlying APIs.
            </p>
          </section>

          <Separator />

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              Third-party terms
            </h2>
            <p>
              Use of YouTube data is governed by YouTube&apos;s Terms of Service. You
              can review them at{" "}
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-foreground underline underline-offset-4"
              >
                https://www.youtube.com/t/terms
              </a>
              .
            </p>
          </section>
        </CardContent>
      </Card>
    </AppShell>
  );
}
