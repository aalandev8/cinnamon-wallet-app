import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/** E2E against a local stack: Anvil on 127.0.0.1:8545 and Alto on 127.0.0.1:4337 must already be running. */
export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  expect: { timeout: 60_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: `http://localhost:${PORT}/app`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
