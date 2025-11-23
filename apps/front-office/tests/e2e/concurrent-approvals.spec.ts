import { test, expect, type Page, type Route } from "@playwright/test";

test.describe("User Approval - Concurrent Operations", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin and navigate to users page
    await page.goto("/login");
    // TODO: Replace with actual login flow when implemented
    await page.goto("/users");
  });

  test("concurrent approvals from single admin work independently", async ({
    page,
  }) => {
    // Mock API responses for multiple users
    await page.route("**/api/users/approve", async route => {
      const request = route.request();
      const postData = request.postDataJSON();
      const userId = postData.userIds[0];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "1 user approved",
          results: [
            {
              userId,
              success: true,
              emailSent: true,
              user: {
                id: userId,
                email: `user-${userId}@example.com`,
                approved: true,
                emailVerified: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          ],
          approvedCount: 1,
          failedCount: 0,
        }),
      });
    });

    // Get all approve buttons
    const approveButtons = page.getByRole("button", { name: /approve/i });
    const buttonCount = await approveButtons.count();

    // Ensure we have at least 2 buttons
    expect(buttonCount).toBeGreaterThanOrEqual(2);

    // Click first two buttons rapidly
    const button1 = approveButtons.nth(0);
    const button2 = approveButtons.nth(1);

    // Click both buttons simultaneously
    await Promise.all([button1.click(), button2.click()]);

    // Both buttons should show loading state
    await expect(button1).toBeDisabled();
    await expect(button2).toBeDisabled();

    // Wait for both to complete
    await expect(button1).toContainText(/approved/i, { timeout: 5000 });
    await expect(button2).toContainText(/approved/i, { timeout: 5000 });

    // Both should remain disabled after approval
    await expect(button1).toBeDisabled();
    await expect(button2).toBeDisabled();
  });

  test("concurrent approvals from two admins (idempotent)", async ({
    browser,
  }) => {
    // Create two browser contexts (simulate two admins)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    let approvalCount = 0;

    // Mock API for both contexts - same user ID will be approved
    const setupMock = async (page: Page) => {
      await page.route("**/api/users/approve", async (route: Route) => {
        approvalCount++;
        const request = route.request();
        const postData = request.postDataJSON();
        const userId = postData.userIds[0];

        // Simulate slight delay
        await new Promise(resolve => setTimeout(resolve, 100));

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "1 user approved",
            results: [
              {
                userId,
                success: true,
                emailSent: true,
                user: {
                  id: userId,
                  email: `user-${userId}@example.com`,
                  approved: true,
                  emailVerified: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              },
            ],
            approvedCount: 1,
            failedCount: 0,
          }),
        });
      });
    };

    await setupMock(page1);
    await setupMock(page2);

    // Navigate both admins to users page
    await page1.goto("/users");
    await page2.goto("/users");

    // Both admins find the first approve button (same user)
    const button1 = page1.getByRole("button", { name: /approve/i }).first();
    const button2 = page2.getByRole("button", { name: /approve/i }).first();

    // Both click simultaneously
    await Promise.all([button1.click(), button2.click()]);

    // Both should show loading state
    await expect(button1).toBeDisabled();
    await expect(button2).toBeDisabled();

    // Wait for both operations to complete
    await expect(button1).toContainText(/approved/i, { timeout: 5000 });
    await expect(button2).toContainText(/approved/i, { timeout: 5000 });

    // Both should succeed (idempotent behavior)
    // No error toasts should appear
    const toast1 = page1.locator("[data-sonner-toast]").filter({
      hasText: /error|failed/i,
    });
    const toast2 = page2.locator("[data-sonner-toast]").filter({
      hasText: /error|failed/i,
    });

    await expect(toast1).not.toBeVisible();
    await expect(toast2).not.toBeVisible();

    // Verify both API calls were made (2 approvals for same user)
    expect(approvalCount).toBe(2);

    // Cleanup
    await context1.close();
    await context2.close();
  });

  test("multiple concurrent operations maintain independent loading states", async ({
    page,
  }) => {
    const completedUsers = new Set<string>();

    // Mock API with variable delays
    await page.route("**/api/users/approve", async route => {
      const request = route.request();
      const postData = request.postDataJSON();
      const userId = postData.userIds[0];

      // Different delays for different users
      const delays: Record<string, number> = {
        "user-1": 100,
        "user-2": 300,
        "user-3": 200,
      };

      await new Promise(resolve => setTimeout(resolve, delays[userId] || 100));

      completedUsers.add(userId);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "1 user approved",
          results: [
            {
              userId,
              success: true,
              emailSent: true,
              user: {
                id: userId,
                email: `${userId}@example.com`,
                approved: true,
                emailVerified: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          ],
          approvedCount: 1,
          failedCount: 0,
        }),
      });
    });

    // Get first 3 approve buttons
    const buttons = await page.getByRole("button", { name: /approve/i }).all();
    const button1 = buttons[0];
    const button2 = buttons[1];
    const button3 = buttons[2];

    // Click all three simultaneously
    await Promise.all([button1.click(), button2.click(), button3.click()]);

    // All should show loading immediately
    await expect(button1).toBeDisabled();
    await expect(button2).toBeDisabled();
    await expect(button3).toBeDisabled();

    // Wait for all to complete (they complete in different order due to delays)
    await expect(button1).toContainText(/approved/i, { timeout: 5000 });
    await expect(button2).toContainText(/approved/i, { timeout: 5000 });
    await expect(button3).toContainText(/approved/i, { timeout: 5000 });

    // All should remain disabled
    await expect(button1).toBeDisabled();
    await expect(button2).toBeDisabled();
    await expect(button3).toBeDisabled();

    // Verify all completed
    expect(completedUsers.size).toBe(3);
  });

  test("one approval failure doesn't affect other concurrent operations", async ({
    page,
  }) => {
    let requestCount = 0;

    await page.route("**/api/users/approve", async route => {
      const request = route.request();
      const postData = request.postDataJSON();
      const userId = postData.userIds[0];
      requestCount++;

      // First request fails, second succeeds
      if (requestCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Internal server error",
            code: "INTERNAL_ERROR",
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "1 user approved",
            results: [
              {
                userId,
                success: true,
                emailSent: true,
                user: {
                  id: userId,
                  email: `${userId}@example.com`,
                  approved: true,
                  emailVerified: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              },
            ],
            approvedCount: 1,
            failedCount: 0,
          }),
        });
      }
    });

    const buttons = await page.getByRole("button", { name: /approve/i }).all();
    const button1 = buttons[0];
    const button2 = buttons[1];

    // Click both
    await Promise.all([button1.click(), button2.click()]);

    // Button 1 should show error toast and return to clickable state
    const errorToast = page
      .locator("[data-sonner-toast]")
      .filter({ hasText: /error|failed/i });
    await expect(errorToast).toBeVisible({ timeout: 3000 });

    await expect(button1).toBeEnabled({ timeout: 3000 });
    await expect(button1).toContainText(/approve/i);

    // Button 2 should succeed
    await expect(button2).toContainText(/approved/i, { timeout: 5000 });
    await expect(button2).toBeDisabled();
  });

  test("accessibility maintained during concurrent operations", async ({
    page,
  }) => {
    await page.route("**/api/users/approve", async route => {
      await new Promise(resolve => setTimeout(resolve, 200));

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "1 user approved",
          results: [
            {
              userId: "test-id",
              success: true,
              emailSent: true,
              user: {
                id: "test-id",
                approved: true,
                emailVerified: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          ],
          approvedCount: 1,
          failedCount: 0,
        }),
      });
    });

    const buttons = await page.getByRole("button", { name: /approve/i }).all();
    const button1 = buttons[0];
    const button2 = buttons[1];

    // Check initial aria-labels
    const label1 = await button1.getAttribute("aria-label");
    const label2 = await button2.getAttribute("aria-label");

    expect(label1).toContain("Approve");
    expect(label2).toContain("Approve");

    // Click both
    await Promise.all([button1.click(), button2.click()]);

    // Check aria-busy during loading
    await expect(button1).toHaveAttribute("aria-busy", "true");
    await expect(button2).toHaveAttribute("aria-busy", "true");

    // Check aria-labels updated
    const loadingLabel1 = await button1.getAttribute("aria-label");
    const loadingLabel2 = await button2.getAttribute("aria-label");

    expect(loadingLabel1).toContain("Approving");
    expect(loadingLabel2).toContain("Approving");

    // Wait for completion
    await expect(button1).toContainText(/approved/i, { timeout: 5000 });
    await expect(button2).toContainText(/approved/i, { timeout: 5000 });

    // Check final state
    await expect(button1).toHaveAttribute("aria-busy", "false");
    await expect(button2).toHaveAttribute("aria-busy", "false");
  });
});
