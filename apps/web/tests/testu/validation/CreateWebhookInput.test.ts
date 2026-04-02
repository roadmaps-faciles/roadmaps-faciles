import { CreateWebhookInput } from "@/useCases/ee/webhooks/CreateWebhook";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("CreateWebhookInput schema", () => {
  const valid = {
    tenantId: 1,
    url: "https://webhook.example.com/hook",
    event: "post.created" as const,
  };

  it("accepts valid data", () => {
    expectZodSuccess(CreateWebhookInput, valid);
  });

  it("accepts all valid events", () => {
    const events = ["post.created", "post.status_changed", "comment.created", "like.added", "invitation.accepted"];
    for (const event of events) {
      expectZodSuccess(CreateWebhookInput, { ...valid, event });
    }
  });

  it("rejects invalid event", () => {
    expectZodFailure(CreateWebhookInput, { ...valid, event: "unknown.event" });
  });

  it("rejects invalid URL", () => {
    expectZodFailure(CreateWebhookInput, { ...valid, url: "not-a-url" });
  });

  it("rejects missing URL", () => {
    const { url: _, ...data } = valid;
    expectZodFailure(CreateWebhookInput, data);
  });

  it("rejects missing event", () => {
    const { event: _, ...data } = valid;
    expectZodFailure(CreateWebhookInput, data);
  });

  it("rejects missing tenantId", () => {
    const { tenantId: _, ...data } = valid;
    expectZodFailure(CreateWebhookInput, data);
  });
});
