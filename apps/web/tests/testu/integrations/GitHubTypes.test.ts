vi.mock("server-only", () => ({}));

import { parseRepoFullName } from "@/lib/ee/integration-provider/impl/github/types";

describe("parseRepoFullName", () => {
  it("parses owner/repo", () => {
    expect(parseRepoFullName("owner/repo")).toEqual({ owner: "owner", repo: "repo" });
  });

  it("parses org/my-repo with hyphens", () => {
    expect(parseRepoFullName("org/my-repo")).toEqual({ owner: "org", repo: "my-repo" });
  });

  it("throws on invalid input without slash", () => {
    expect(() => parseRepoFullName("invalid")).toThrow("Invalid repository full name: invalid");
  });

  it("throws on empty string", () => {
    expect(() => parseRepoFullName("")).toThrow("Invalid repository full name: ");
  });

  it("throws on trailing slash with no repo", () => {
    expect(() => parseRepoFullName("owner/")).toThrow("Invalid repository full name: owner/");
  });
});
