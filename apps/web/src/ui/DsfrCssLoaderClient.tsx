"use client";

import { lazy, Suspense } from "react";

const DsfrCssLoaderLazy = lazy(() => import("./DsfrCssLoader").then(m => ({ default: m.DsfrCssLoader })));

/**
 * Client wrapper that lazy-loads DsfrCssLoader via React.lazy().
 *
 * Why not `next/dynamic` in the Server Component layout?
 * → Turbopack eagerly bundles CSS from `next/dynamic` in server components,
 *   causing DSFR CSS to leak into Default theme pages.
 *   React.lazy() in a "use client" component defers CSS until actual render.
 */
export const DsfrCssLoaderClient = () => (
  <Suspense>
    <DsfrCssLoaderLazy />
  </Suspense>
);
