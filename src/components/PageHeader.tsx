"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  badgeLabel?: string;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  badgeLabel = "Density",
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      <Badge
        variant="secondary"
        className="w-fit text-xs font-semibold uppercase tracking-[0.25em]"
      >
        {badgeLabel}
      </Badge>
      <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
        {title}
      </h1>
      <p className="text-base text-muted-foreground md:text-lg">{subtitle}</p>
    </header>
  );
}
