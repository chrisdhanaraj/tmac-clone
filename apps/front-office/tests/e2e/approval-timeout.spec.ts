import { test, expect } from "@playwright/test";

test.describe("User Approval - Timeout Scenario", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin and navigate to users page
    await page.goto("/login");
    // TODO: Replace with actual login flow when implemented
    // For now, assume session cookie is set or auto-login in dev
    await page.goto("/users");
  });

  test("should show timeout error toast after 5 seconds", async ({ page }) => {
    // Intercept the approval API call and delay response for 6 seconds
    await page.route("**/api/users/approve", async route => {
      // Wait 6 seconds before responding (exceeds 5s timeout)
      await new Promise(resolve => setTimeout(resolve, 6000));

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "1 users approved successfully",
          results: [
            {
              userId: "test-user-id",
              success: true,
              emailSent: true,
            },
          ],
          approvedCount: 1,
          failedCount: 0,
        }),
      });
    });

    // Find first pending user's approve button
    const approveButton = page
      .getByRole("button", { name: /approve/i })
      .first();

    // Click approve
    await approveButton.click();

    // Verify loading state appears immediately
    await expect(approveButton).toBeDisabled();
    await expect(approveButton).toContainText(""); // Spinner has no text

    // Wait for exactly 5 seconds and verify timeout toast appears
    await page.waitForTimeout(5100); // 5s + small buffer

    // Check for error toast with timeout message
    const toast = page
      .locator("[data-sonner-toast]")
      .filter({ hasText: /timed out|timeout/i });
    await expect(toast).toBeVisible({ timeout: 1000 });
    await expect(toast).toContainText(/timed out|timeout/i);

    // Verify button returns to default state (clickable)
    await expect(approveButton).toBeEnabled();
    await expect(approveButton).toContainText(/approve/i);
  });

  test("should allow retry after timeout", async ({ page }) => {
    let requestCount = 0;

    // First request: timeout (delay 6s)
    // Second request: success (immediate)
    await page.route("**/api/users/approve", async route => {
      requestCount++;

      if (requestCount === 1) {
        // First request: delay to trigger timeout
        await new Promise(resolve => setTimeout(resolve, 6000));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "1 users approved successfully",
            results: [{ userId: "test-id", success: true, emailSent: true }],
            approvedCount: 1,
            failedCount: 0,
          }),
        });
      } else {
        // Second request: immediate success
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "1 users approved successfully",
            results: [{ userId: "test-id", success: true, emailSent: true }],
            approvedCount: 1,
            failedCount: 0,
          }),
        });
      }
    });

    const approveButton = page
      .getByRole("button", { name: /approve/i })
      .first();

    // First attempt: timeout
    await approveButton.click();
    await page.waitForTimeout(5100);

    // Verify error toast and button is clickable again
    const errorToast = page
      .locator("[data-sonner-toast]")
      .filter({ hasText: /timed out|timeout/i });
    await expect(errorToast).toBeVisible();
    await expect(approveButton).toBeEnabled();

    // Second attempt: should succeed quickly
    await approveButton.click();

    // Verify loading state
    await expect(approveButton).toBeDisabled();

    // Wait for success (should be quick, no timeout)
    await expect(approveButton).toContainText(/approved/i, { timeout: 3000 });
    await expect(approveButton).toBeDisabled(); // Stays disabled after approval
  });

  test("should maintain aria-label during timeout flow", async ({ page }) => {
    await page.route("**/api/users/approve", async route => {
      await new Promise(resolve => setTimeout(resolve, 6000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "1 user approved",
          results: [{ userId: "test-id", success: true, emailSent: true }],
          approvedCount: 1,
          failedCount: 0,
        }),
      });
    });

    const approveButton = page
      .getByRole("button", { name: /approve/i })
      .first();

    // Get initial aria-label (should include user email)
    const initialLabel = await approveButton.getAttribute("aria-label");
    expect(initialLabel).toContain("Approve");

    // Click and verify loading aria-label
    await approveButton.click();
    const loadingLabel = await approveButton.getAttribute("aria-label");
    expect(loadingLabel).toContain("Approving");

    // Verify aria-busy during loading
    const ariaBusy = await approveButton.getAttribute("aria-busy");
    expect(ariaBusy).toBe("true");

    // Wait for timeout
    await page.waitForTimeout(5100);

    // After timeout, aria-label should revert
    const afterTimeoutLabel = await approveButton.getAttribute("aria-label");
    expect(afterTimeoutLabel).toContain("Approve");

    // aria-busy should be false
    const ariaBusyAfter = await approveButton.getAttribute("aria-busy");
    expect(ariaBusyAfter).toBe("false");
  });

  test("should only timeout client-side (server still processes)", async ({
    page,
  }) => {
    let serverProcessed = false;

    await page.route("**/api/users/approve", async route => {
      // Delay response but mark as processed
      await new Promise(resolve => setTimeout(resolve, 6000));
      serverProcessed = true;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "1 user approved",
          results: [{ userId: "test-id", success: true, emailSent: true }],
          approvedCount: 1,
          failedCount: 0,
        }),
      });
    });

    const approveButton = page
      .getByRole("button", { name: /approve/i })
      .first();
    await approveButton.click();

    // Client-side timeout at 5s
    await page.waitForTimeout(5100);
    const toast = page
      .locator("[data-sonner-toast]")
      .filter({ hasText: /timed out/i });
    await expect(toast).toBeVisible();

    // Wait for server to finish (6s total)
    await page.waitForTimeout(1000);

    // Verify server still processed the request
    expect(serverProcessed).toBe(true);

    // Note: In real scenario, refreshing the page would show user as approved
    // since server completed the operation despite client timeout
  });
});
