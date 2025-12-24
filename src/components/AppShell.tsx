"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const QuoteTicker = dynamic(() => import("@/components/QuoteTicker"), {
  ssr: false,
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
  const [showTicker, setShowTicker] = useState(false);

  // Defer the animated ticker until idle time to keep first paint lightweight.
  useEffect(() => {
    const requestIdle = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    const cancelIdle = (
      window as Window & { cancelIdleCallback?: (id: number) => void }
    ).cancelIdleCallback;
    let idleId: number | null = null;
    let timeoutId: number | null = null;

    if (requestIdle) {
      idleId = requestIdle(() => setShowTicker(true), { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(() => setShowTicker(true), 1200);
    }

    return () => {
      if (idleId !== null && cancelIdle) {
        cancelIdle(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="pt-[env(safe-area-inset-top)]">
        <div className={cn("mx-auto w-full", sizeClasses[size])}>
          {showTicker ? (
            <QuoteTicker />
          ) : (
            <div
              className="min-h-[52px] border-b border-border bg-card/95 dark:bg-background sm:min-h-[44px]"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
      <div
        className={cn(
          "mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10 md:py-12 lg:py-16",
          sizeClasses[size],
          className
        )}
      >
        <div className="flex-1 space-y-8 sm:space-y-10">{children}</div>
        <div className="my-6 h-px w-full bg-border sm:my-8" />
        <Footer channelUrl={footerChannelUrl} />
      </div>
    </div>
  );
}
