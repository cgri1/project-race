import { test, expect } from "@playwright/test";

test.describe("Horse Racing Application", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Initial State", () => {
    test("should display initial page elements", async ({ page }) => {
      // Check main components are present
      await expect(page.locator("h1")).toContainText("Horse Race");
      await expect(page.locator(".controls")).toBeVisible();
      await expect(page.locator(".track")).toBeVisible();
      await expect(page.locator(".horse-list")).toBeVisible();
      await expect(page.locator(".results")).toBeVisible();
    });
  });
});
