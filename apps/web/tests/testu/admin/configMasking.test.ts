import { flattenConfig, isSensitiveKey, maskValue } from "@/app/admin/config/configUtils";

describe("isSensitiveKey", () => {
  it.each([
    "secret",
    "password",
    "apiKey",
    "clientSecret",
    "encryptionKey",
    "licenseKey",
    "webhookSecret",
    "cronSecret",
  ])("recognizes '%s' as sensitive", key => {
    expect(isSensitiveKey(key)).toBe(true);
  });

  it.each(["host", "port", "type", "name", "url", "email", "enabled", "locale"])(
    "rejects '%s' as not sensitive",
    key => {
      expect(isSensitiveKey(key)).toBe(false);
    },
  );

  it("normalizes dashes and underscores", () => {
    expect(isSensitiveKey("api-key")).toBe(true);
    expect(isSensitiveKey("api_key")).toBe(true);
    expect(isSensitiveKey("API_KEY")).toBe(true);
  });
});

describe("maskValue", () => {
  it("masks short values (≤4 chars) completely", () => {
    expect(maskValue("ab")).toBe("••••");
    expect(maskValue("abcd")).toBe("••••");
  });

  it("masks long values keeping first 2 and last 2 chars", () => {
    expect(maskValue("abcdef")).toBe("ab••••ef");
    expect(maskValue("sk_test_1234567890")).toBe("sk••••90");
  });

  it("masks exactly 5 chars", () => {
    expect(maskValue("12345")).toBe("12••••45");
  });
});

describe("flattenConfig", () => {
  it("flattens nested objects with dotted prefixes", () => {
    const result = flattenConfig({ mailer: { host: "smtp.example.com", port: 587 } });

    expect(result).toEqual([
      { key: "mailer.host", value: "smtp.example.com", masked: false },
      { key: "mailer.port", value: "587", masked: false },
    ]);
  });

  it("masks values for sensitive keys", () => {
    const result = flattenConfig({ security: { secret: "my-super-secret" } });

    const entry = result.find(e => e.key === "security.secret");
    expect(entry?.masked).toBe(true);
    expect(entry?.value).toBe("my••••et");
  });

  it("does not mask empty sensitive values", () => {
    const result = flattenConfig({ oauth: { clientSecret: "" } });

    const entry = result.find(e => e.key === "oauth.clientSecret");
    expect(entry?.masked).toBe(false);
    expect(entry?.value).toBe("");
  });

  it("joins arrays with comma separator", () => {
    const result = flattenConfig({ admins: ["alice", "bob", "charlie"] });

    expect(result).toEqual([{ key: "admins", value: "alice, bob, charlie", masked: false }]);
  });

  it("handles null and undefined values", () => {
    const result = flattenConfig({ a: null, b: undefined });

    expect(result).toEqual([
      { key: "a", value: "", masked: false },
      { key: "b", value: "", masked: false },
    ]);
  });
});
