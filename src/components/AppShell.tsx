"use client";

import type { ReactNode } from "react";
import Footer from "@/components/Footer";
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
    <div className="min-h-screen bg-background text-foreground">
      <div
        className={cn(
          "mx-auto flex min-h-screen w-full flex-col px-6 py-12 md:py-16",
          sizeClasses[size],
          className
        )}
      >
        <div className="flex-1 space-y-10">{children}</div>
        <Separator className="my-8" />
        <Footer channelUrl={footerChannelUrl} />
      </div>
    </div>
  );
}
