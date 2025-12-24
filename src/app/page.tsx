import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground">
          <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12 md:py-16">
            <div className="space-y-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="mt-10">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}
