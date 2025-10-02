/**
 * Shared test setup for Playwright tests
 */

import { test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  if (process.env.CI) {
    // Override visibility issues in CI
    await page.addStyleTag({
      content: "html,body{visibility:visible!important}",
    });
  }
});
