import { defineConfig, devices } from "@playwright/test";

const AUTH_DIR = "tests/teste2e/.auth";
const ROOT_URL = "http://localhost:3000";
const E2E_HOST = "e2e.localhost";
const TENANT_URL = `http://${E2E_HOST}:3000`;

// Chromium flag to resolve e2e.localhost without /etc/hosts (CI-compatible)
const HOST_RULES = `--host-resolver-rules=MAP ${E2E_HOST} 127.0.0.1`;

export default defineConfig({
  testDir: "./tests/teste2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: ROOT_URL,
    trace: "on-first-retry",
  },
  projects: [
    // --- Setup: creates 3 auth states ---
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },

    // --- Root (no tenant header) ---
    {
      name: "root-auth",
      use: {
        ...devices["Desktop Chrome"],
        storageState: `${AUTH_DIR}/admin.json`,
        launchOptions: { args: [HOST_RULES] },
      },
      dependencies: ["setup"],
      testMatch: /\b(root-admin|profile|auth-bridge)\.spec\.ts/,
    },

    // --- Tenant: admin ---
    {
      name: "tenant-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: `${AUTH_DIR}/admin.json`,
        baseURL: TENANT_URL,
        launchOptions: { args: [HOST_RULES] },
      },
      dependencies: ["setup"],
      testMatch: /\b(tenant-admin|tenant-admin-extras|board|moderation)\.spec\.ts/,
    },

    // --- Tenant: moderator ---
    {
      name: "tenant-mod",
      use: {
        ...devices["Desktop Chrome"],
        storageState: `${AUTH_DIR}/mod.json`,
        baseURL: TENANT_URL,
        launchOptions: { args: [HOST_RULES] },
      },
      dependencies: ["setup"],
      testMatch: /\bmoderation\.spec\.ts/,
    },

    // --- Tenant: user ---
    {
      name: "tenant-user",
      use: {
        ...devices["Desktop Chrome"],
        storageState: `${AUTH_DIR}/user.json`,
        baseURL: TENANT_URL,
        launchOptions: { args: [HOST_RULES] },
      },
      dependencies: ["setup"],
      testMatch: /\b(post|search|i18n)\.spec\.ts/,
    },

    // --- Unauthenticated ---
    {
      name: "unauthenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: `${AUTH_DIR}/consent.json`,
        launchOptions: { args: [HOST_RULES] },
      },
      dependencies: ["setup"],
      testMatch: /\b(health|home|auth|auth-magic-link|auth-bridge|routing|api|embed|legal)\.spec\.ts/,
    },

    // --- Mobile ---
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
        storageState: `${AUTH_DIR}/user.json`,
        baseURL: TENANT_URL,
        launchOptions: { args: [HOST_RULES] },
      },
      dependencies: ["setup"],
      testMatch: /\bboard\.spec\.ts/,
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
