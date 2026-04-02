import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

/** Tenant base URL for E2E tests — used as baseURL in tenant Playwright projects */
export const E2E_TENANT_URL = "http://e2e.localhost:3000";

const MAILDEV_API = process.env.MAILDEV_URL || "http://localhost:1080";

interface MaildevEmail {
  from: Array<{ address: string; name: string }>;
  html: string;
  id: string;
  subject: string;
  text: string;
  to: Array<{ address: string; name: string }>;
}

interface MaildevFixture {
  /** Delete all emails in Maildev inbox. */
  clearInbox(): Promise<void>;
  /** Extract the magic link (verification URL) from a Maildev email HTML body. */
  extractLink(email: MaildevEmail): string;
  /** Poll Maildev until an email arrives for the given address (max 15s). */
  getLatestEmail(to: string): Promise<MaildevEmail>;
}

/**
 * Extended test with tenant-aware helpers and Maildev fixture.
 * All spec files should import { test, expect } from "./fixtures".
 */
export const test = base.extend<{ maildev: MaildevFixture }>({
  // eslint-disable-next-line no-empty-pattern
  maildev: async ({}, use) => {
    const helper: MaildevFixture = {
      async getLatestEmail(to: string): Promise<MaildevEmail> {
        const deadline = Date.now() + 15_000;
        while (Date.now() < deadline) {
          const res = await fetch(`${MAILDEV_API}/email`);
          const emails = (await res.json()) as MaildevEmail[];
          const match = [...emails].reverse().find(e => e.to.some(r => r.address === to));
          if (match) return match;
          await new Promise(r => setTimeout(r, 500));
        }
        throw new Error(`No email received for ${to} within 15s`);
      },

      extractLink(email: MaildevEmail): string {
        const match = email.html.match(/href="([^"]*\/api\/auth\/callback\/[^"]*)"/);
        if (!match?.[1]) {
          throw new Error("No magic link found in email HTML");
        }
        return match[1].replace(/&amp;/g, "&");
      },

      async clearInbox(): Promise<void> {
        // Retry with backoff — Maildev may not be fully ready or may drop connections
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await fetch(`${MAILDEV_API}/email/all`, { method: "DELETE" });
            return;
          } catch {
            if (attempt === 2) throw new Error(`Maildev clearInbox failed after 3 attempts (${MAILDEV_API})`);
            await new Promise(r => setTimeout(r, 1_000 * (attempt + 1)));
          }
        }
      },
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(helper);
  },
});
