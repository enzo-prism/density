"use client";

import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import QuoteTicker from "@/components/QuoteTicker";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
        <div className="flex-1 space-y-8 sm:space-y-10">{children}</div>
        <Separator className="my-6 sm:my-8" />
        <Footer channelUrl={footerChannelUrl} />
      </div>
    </div>
  );
}
