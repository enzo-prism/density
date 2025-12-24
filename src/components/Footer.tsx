import Link from "next/link";

type FooterProps = {
  className?: string;
  channelUrl?: string;
};

export default function Footer({ className, channelUrl }: FooterProps) {
  return (
    <footer className={`py-6 text-xs text-muted-foreground ${className ?? ""}`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <span>Only public uploads are counted.</span>
          {channelUrl ? (
            <a
              href={channelUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Data from YouTube
            </a>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            YouTube Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
