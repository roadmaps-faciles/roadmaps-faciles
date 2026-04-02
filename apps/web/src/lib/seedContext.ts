import { type Tenant } from "@/lib/model/Tenant";

let _seedTenant: null | Tenant = null;

export function setSeedTenant(tenant: Tenant) {
  _seedTenant = tenant;
}

export function getSeedTenant(): Tenant {
  if (!_seedTenant) {
    throw new Error("Seed tenant is not set. Call setSeedTenant() before accessing it.");
  }
  return _seedTenant;
}
