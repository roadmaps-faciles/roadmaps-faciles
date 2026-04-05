import { execSync } from "node:child_process";

describe("email template sizes", () => {
  it("all templates are under 80 Ko (Gmail clips at 102 Ko)", () => {
    execSync("pnpm tsx scripts/check-email-sizes.ts", {
      cwd: process.cwd(),
      stdio: "pipe",
    });
  });
});
