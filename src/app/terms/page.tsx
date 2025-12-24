import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
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
          <h1 className="text-4xl font-semibold">Terms</h1>
          <p className="text-sm text-muted-foreground">
            By using Density, you agree to be bound by YouTube&apos;s Terms of
            Service.
          </p>
        </header>

        <main className="mt-8 space-y-6 text-sm text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              Service overview
            </h2>
            <p>
              Density provides posting-frequency insights for public YouTube
              channels by analyzing public metadata from YouTube API Services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              Acceptable use
            </h2>
            <p>
              You agree to use the service for lawful purposes and not to misuse
              or attempt to disrupt the service or its underlying APIs.
            </p>
          </section>

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
                className="font-semibold text-foreground underline-offset-4 hover:underline"
              >
                https://www.youtube.com/t/terms
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
