"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(nextTheme)}
      className={cn(
        "h-7 gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <Moon className="h-3.5 w-3.5 transition-all dark:-rotate-90 dark:scale-0" />
        <Sun className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </span>
      <span className="dark:hidden">Dark</span>
      <span className="hidden dark:inline">Light</span>
    </Button>
  );
}
