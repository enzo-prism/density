"use client";

import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const QuoteTicker = dynamic(() => import("@/components/QuoteTicker"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-[52px] border-b border-border bg-card/95 dark:bg-background sm:min-h-[44px]"
      aria-hidden="true"
    />
  ),
});

type AppShellProps = {
  children: ReactNode;
  footerChannelUrl?: string;
  size?: "default" | "narrow";
  className?: string;
};

const sizeClasses = {
  default: "max-w-6xl",
  narrow: "max-w-4xl",
};

export default function AppShell({
  children,
  footerChannelUrl,
  size = "default",
  className,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="pt-[env(safe-area-inset-top)]">
        <div className={cn("mx-auto w-full", sizeClasses[size])}>
          <QuoteTicker />
        </div>
      </div>
      <div
        className={cn(
          "mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10 md:py-12 lg:py-16",
          sizeClasses[size],
          className
        )}
      >
        <main className="flex min-h-screen flex-1 flex-col space-y-8 sm:space-y-10">
          {children}
        </main>
        <div className="my-6 h-px w-full bg-border sm:my-8" />
        <Footer channelUrl={footerChannelUrl} />
      </div>
    </div>
  );
}
