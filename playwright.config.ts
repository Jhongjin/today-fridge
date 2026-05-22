import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/playwright",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: "mobile-360",
      use: {
        browserName: "chromium",
        isMobile: true,
        hasTouch: true,
        viewport: { width: 360, height: 740 }
      }
    },
    {
      name: "mobile-390",
      use: {
        browserName: "chromium",
        isMobile: true,
        hasTouch: true,
        viewport: { width: 390, height: 844 }
      }
    },
    {
      name: "mobile-430",
      use: {
        browserName: "chromium",
        isMobile: true,
        hasTouch: true,
        viewport: { width: 430, height: 932 }
      }
    }
  ]
});
