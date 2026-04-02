import path from "node:path";
import { fileURLToPath } from "node:url";
import { coverageConfigDefaults, defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/components/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}"],
      exclude: [...coverageConfigDefaults.exclude, "**/*.stories.*", "**/*.test.*"],
    },
    projects: [path.resolve(dirname, "vitest.config.unit.ts"), path.resolve(dirname, "vitest.config.storybook.ts")],
  },
});
