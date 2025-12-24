"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

type FooterProps = {
  className?: string;
  channelUrl?: string;
};

export default function Footer({ className, channelUrl }: FooterProps) {
  return (
    <footer className={`py-6 text-xs text-muted-foreground ${className ?? ""}`}>
      <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:gap-4">
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
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
