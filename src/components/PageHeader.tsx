"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  caption?: ReactNode;
  logoSrc?: string;
  logoAlt?: string;
  badgeLabel?: string;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  caption,
  logoSrc,
  logoAlt = "Prism logo",
  badgeLabel,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col items-center text-center space-y-3", className)}>
      {badgeLabel ? (
        <Badge
          variant="secondary"
          className="w-fit text-xs font-semibold uppercase tracking-[0.25em]"
        >
          {badgeLabel}
        </Badge>
      ) : null}
      {logoSrc ? (
        <div className="flex justify-center">
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl object-cover"
            priority
          />
        </div>
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
        <div className="font-text text-xs italic text-muted-foreground">
          {caption}
        </div>
      ) : null}
    </header>
  );
}
