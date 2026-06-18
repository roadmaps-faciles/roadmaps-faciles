import "server-only";

/**
 * Dev-only override shared across ALL hosts served by the single `next dev` process (localhost AND
 * *.localhost). Chrome doesn't share `Domain=localhost` cookies with subdomains and a root response
 * can't set a cookie for a child subdomain, so cookies can't carry the override onto tenant pages.
 * In-process state can. Stored on globalThis to survive Turbopack/HMR module re-evaluation.
 *
 * Process-wide (not per-browser), which is exactly the right granularity: deployment mode and license
 * are instance-level, not per-tenant. Never consulted outside dev.
 */
export interface DevOverrides {
  deploymentMode?: "cloud" | "self-host";
  licenseKey?: null | string;
  licenseOffline?: boolean;
  /** Cloud billing dev toggle: use the real Stripe checkout vs the dev-checkout bypass. */
  useStripe?: boolean;
}

const store = globalThis as { __rfDevOverrides?: DevOverrides } & typeof globalThis;
store.__rfDevOverrides ??= {};

export const devOverrides: DevOverrides = store.__rfDevOverrides;
