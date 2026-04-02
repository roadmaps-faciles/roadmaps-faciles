"use client";

import "@prisma/studio-core/ui/index.css";
import { createStudioBFFClient } from "@prisma/studio-core/data/bff";
import { createPostgresAdapter } from "@prisma/studio-core/data/postgres-core";
import dynamic from "next/dynamic";
import { Suspense, useMemo } from "react";

// Dynamically import Studio with no SSR to avoid hydration issues
const Studio = dynamic(() => import("@prisma/studio-core/ui").then(mod => mod.Studio), {
  ssr: false,
});

const StudioLoading = () => (
  <div className="flex h-full items-center justify-center">
    <div className="text-center">
      <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-primary"></div>
      <p className="mt-4 text-muted-foreground">Loading Studio...</p>
    </div>
  </div>
);

// Client-only Studio component
const ClientOnlyStudio = () => {
  const adapter = useMemo(() => {
    // Create the HTTP client that communicates with our API endpoint
    const executor = createStudioBFFClient({
      url: "/api/studio",
      fetch,
    });

    // Create the Postgres adapter using the executor
    return createPostgresAdapter({ executor });
  }, []);
  return <Studio adapter={adapter} />;
};

export default function PrismaPage() {
  return (
    <Suspense fallback={<StudioLoading />}>
      <div className="h-[calc(100vh-80px)]">
        <ClientOnlyStudio />
      </div>
    </Suspense>
  );
}
