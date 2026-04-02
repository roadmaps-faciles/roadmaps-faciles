import { expect, test as setup } from "@playwright/test";
import { writeFileSync } from "node:fs";

const AUTH_DIR = "tests/teste2e/.auth";
const ROOT_URL = "http://localhost:3000";

// DSFR consent banner: pre-accept to prevent it from blocking E2E interactions.
// Key format: prefix + space + finalities joined by "-" (empty here since no finalities defined).
const CONSENT_LOCALSTORAGE = [
  { name: "@codegouvfr/react-dsfr finalityConsent ", value: JSON.stringify({ isFullConsent: true }) },
];

const CONSENT_ORIGINS = [
  { origin: "http://localhost:3000", localStorage: CONSENT_LOCALSTORAGE },
  { origin: "http://e2e.localhost:3000", localStorage: CONSENT_LOCALSTORAGE },
];

for (const { name, email } of [
  { name: "admin", email: "test-admin@test.local" },
  { name: "mod", email: "test-mod@test.local" },
  { name: "user", email: "test-user@test.local" },
]) {
  setup(`authenticate ${name}`, async ({ request }) => {
    // Authenticate on root domain (localhost)
    const response = await request.post(`${ROOT_URL}/api/test-auth`, {
      data: { email },
    });
    expect(response.ok()).toBeTruthy();

    // Get storage state with cookies for localhost
    const state = await request.storageState();

    // Duplicate cookies for e2e.localhost so tenant pages get auth cookies
    // This avoids requiring e2e.localhost DNS resolution for the API context
    const tenantCookies = state.cookies
      .filter(c => c.domain === "localhost")
      .map(c => ({ ...c, domain: "e2e.localhost" }));
    state.cookies.push(...tenantCookies);

    // Add consent localStorage to prevent DSFR consent banner from blocking interactions
    state.origins = CONSENT_ORIGINS;

    // Save storage state with both domain cookies
    writeFileSync(`${AUTH_DIR}/${name}.json`, JSON.stringify(state));
  });
}

// Consent-only state for unauthenticated tests (no auth cookies, just consent dismissal)
setup("consent state", async () => {
  writeFileSync(`${AUTH_DIR}/consent.json`, JSON.stringify({ cookies: [], origins: CONSENT_ORIGINS }));
});
