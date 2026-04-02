import "server-only";

import { type IntegrationType } from "@/prisma/enums";

import { type IIntegrationProvider } from "./IIntegrationProvider";
import { NotionIntegrationProvider } from "./impl/NotionIntegrationProvider";
import { type IntegrationConfig } from "./types";

/**
 * Factory to create an integration provider instance.
 * Unlike DNS/Domain providers, this is NOT a singleton — each tenant integration
 * gets its own instance with its own credentials.
 */
export function createIntegrationProvider(
  type: IntegrationType,
  integrationConfig: IntegrationConfig,
): IIntegrationProvider {
  switch (type) {
    case "NOTION":
      return new NotionIntegrationProvider(integrationConfig);
    default:
      throw new Error(`Unknown integration type: ${type as string}`);
  }
}
