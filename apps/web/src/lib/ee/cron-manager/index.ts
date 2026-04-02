import "server-only";

import { config } from "@/config";

import { type ICronManager } from "./ICronManager";
import { NoopCronManager } from "./impl/NoopCronManager";

let instance: ICronManager | null = null;

export const getCronManager = (): ICronManager => {
  if (instance) return instance;

  switch (config.integrations.cronManager) {
    case "route":
      // RouteCronManager requires deps injection — must be instantiated at use site
      // This factory returns Noop as fallback; route handler creates RouteCronManager directly
      instance = new NoopCronManager();
      break;
    case "noop":
    default:
      instance = new NoopCronManager();
      break;
  }

  return instance;
};
