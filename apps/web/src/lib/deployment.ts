import "server-only";
import { forbidden } from "next/navigation";

import { config } from "@/config";
import { devOverrides } from "@/lib/devOverride";

export type DeploymentMode = "cloud" | "self-host";

/**
 * Resolve whether this instance runs as the official cloud SaaS or self-host.
 * Orthogonal to license status: cloud has no license, self-host may be licensed or community.
 *
 * Prod reads the env flag only. Dev defaults to cloud and can be flipped via the /admin/dev-tools
 * toggle, which sets a process-wide override (shared across all hosts of the single dev process, so it
 * reaches tenant subdomains; it resets on dev server restart).
 */
// eslint-disable-next-line @typescript-eslint/require-await -- async kept for API stability: isCloud/isSelfHost and many call sites await this.
export async function getDeploymentMode(): Promise<DeploymentMode> {
  if (config.env === "dev") return devOverrides.deploymentMode ?? "cloud";
  return config.deployment.mode;
}

export const isCloud = async (): Promise<boolean> => (await getDeploymentMode()) === "cloud";

export const isSelfHost = async (): Promise<boolean> => (await getDeploymentMode()) === "self-host";

/**
 * Guard for cloud-only server actions (billing/addons/checkout/upgrade). Page renders are gated with
 * notFound(), but the underlying Stripe actions stay POST-able: block them in self-host too.
 */
export async function assertCloud(): Promise<void> {
  if (await isSelfHost()) forbidden();
}

/** Guard for self-host-only server actions (e.g. the addon denylist reset). 403 in cloud. */
export async function assertSelfHost(): Promise<void> {
  if (!(await isSelfHost())) forbidden();
}

/**
 * Boot-time guard (no request scope, reads config only). A cloud SaaS always configures Stripe,
 * so "self-host mode + a Stripe secret key" is almost certainly a forgotten DEPLOYMENT_MODE=cloud.
 * Fail loud at startup instead of silently degrading every paid entitlement to the free tier.
 */
export function assertDeploymentConfig(): void {
  if (config.env !== "dev" && config.deployment.mode === "self-host" && config.stripe.secretKey) {
    throw new Error(
      "DEPLOYMENT_MODE is 'self-host' but STRIPE_SECRET_KEY is set. " +
        "Set DEPLOYMENT_MODE=cloud for the official SaaS, or unset Stripe for a self-host instance.",
    );
  }
}
