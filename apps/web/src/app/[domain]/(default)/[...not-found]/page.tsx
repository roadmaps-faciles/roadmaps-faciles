import { notFound } from "next/navigation";

/**
 * Catch-all route to trigger the tenant-level not-found.tsx
 * instead of falling through to the root not-found.
 */
const CatchAllNotFound = () => notFound();

export default CatchAllNotFound;
