"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  caption?: ReactNode;
  badgeLabel?: string;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  caption,
  badgeLabel,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {badgeLabel ? (
        <Badge
          variant="secondary"
          className="w-fit text-xs font-semibold uppercase tracking-[0.25em]"
        >
          {badgeLabel}
        </Badge>
      ) : null}
      <h1 className="text-3xl font-display font-semibold leading-tight sm:text-4xl md:text-5xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-sm text-muted-foreground sm:text-base md:text-lg">
          {subtitle}
        </p>
      ) : null}
      {caption ? (
        <div className="font-text text-[11px] font-medium tracking-[0.16em] text-muted-foreground/80">
          {caption}
        </div>
      ) : null}
    </header>
  );
}
