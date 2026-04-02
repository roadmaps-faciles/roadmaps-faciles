import { config } from "@/config";

import { type IDnsProvider } from "./IDnsProvider";
import { CloudflareDnsProvider } from "./impl/CloudflareDnsProvider";
import { ManualDnsProvider } from "./impl/ManualDnsProvider";
import { NoopDnsProvider } from "./impl/NoopDnsProvider";
import { OvhDnsProvider } from "./impl/OvhDnsProvider";

let instance: IDnsProvider | null = null;

export const getDnsProvider = (): IDnsProvider => {
  if (instance) return instance;

  switch (config.dnsProvider.type) {
    case "ovh":
      instance = new OvhDnsProvider();
      break;
    case "cloudflare":
      instance = new CloudflareDnsProvider();
      break;
    case "manual":
      instance = new ManualDnsProvider();
      break;
    case "noop":
    default:
      instance = new NoopDnsProvider();
      break;
  }

  return instance;
};
