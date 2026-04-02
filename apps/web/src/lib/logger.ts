import "server-only";
import pino from "pino";

import { config } from "@/config";

const isDev = config.env === "dev";

export const logger = pino({
  level: config.observability.logLevel,
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
        },
      }
    : {}),
  base: {
    service: "roadmaps-faciles",
    version: config.appVersion,
    env: config.env,
  },
});

export type Logger = pino.Logger;
