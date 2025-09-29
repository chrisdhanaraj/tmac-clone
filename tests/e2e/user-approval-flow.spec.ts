import { test, expect } from "@playwright/test";

test.describe("User Approval Flow E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // Login as admin user (this would need actual test credentials)
    await page.fill('input[name="email"]', "admin@example.com");
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL("/dashboard");
  });

  test("admin can access user management page", async ({ page }) => {
    // Navigate to user management
    await page.goto("/dashboard/users");

    // Verify page loads
    await expect(page.getByText("User Management")).toBeVisible();
    await expect(page.getByText("Manage user approvals")).toBeVisible();

    // Verify breadcrumbs
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Users")).toBeVisible();
  });

  test("non-admin users cannot access user management", async ({ page }) => {
    // Logout and login as regular user
    await page.goto("/logout");
    await page.goto("/login");

    await page.fill('input[name="email"]', "user@example.com");
    await page.click('button[type="submit"]');

    // Try to access user management
    await page.goto("/dashboard/users");

    // Should be redirected or see error
    await expect(page.getByText(/forbidden|unauthorized/i)).toBeVisible();
  });

  test("admin can view paginated user table", async ({ page }) => {
    await page.goto("/dashboard/users");

    // Verify table is present
    await expect(page.getByRole("table")).toBeVisible();

    // Verify columns
    await expect(page.getByText("First Name")).toBeVisible();
    await expect(page.getByText("Last Name")).toBeVisible();
    await expect(page.getByText("Email")).toBeVisible();
    await expect(page.getByText("Status")).toBeVisible();

    // Verify pagination controls
    await expect(page.getByText("Rows per page")).toBeVisible();
    await expect(page.getByText(/page \d+ of/i)).toBeVisible();
  });

  test("admin can filter users by approval status", async ({ page }) => {
    await page.goto("/dashboard/users");

    // Click status filter dropdown
    await page.click('button:has-text("Filter by status")');

    // Select "Pending" filter
    await page.click('text="Pending"');

    // Verify only pending users are shown
    const statusCells = page.locator('td:has-text("Pending")');
    await expect(statusCells.first()).toBeVisible();

    // Verify no approved users are shown
    const approvedCells = page.locator('td:has-text("Approved")');
    await expect(approvedCells).toHaveCount(0);
  });

  test("admin can search users by email", async ({ page }) => {
    await page.goto("/dashboard/users");

    // Enter search term
    await page.fill('input[placeholder="Filter emails..."]', "john");

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Verify filtered results
    const emailCells = page.locator('td a[href^="mailto:"]');
    const emailTexts = await emailCells.allTextContents();

    for (const email of emailTexts) {
      expect(email.toLowerCase()).toContain("john");
    }
  });

  test("admin can approve a single user", async ({ page }) => {
    await page.goto("/dashboard/users");

    // Filter to show only pending users
    await page.click('button:has-text("Filter by status")');
    await page.click('text="Pending"');

    // Find first pending user and approve
    const firstApproveButton = page
      .locator('button:has-text("Approve")')
      .first();
    await expect(firstApproveButton).toBeVisible();
    await firstApproveButton.click();

    // Verify success feedback
    await expect(page.getByText(/approved successfully/i)).toBeVisible();

    // Verify status changed
    await expect(page.getByText("Approved")).toBeVisible();
  });

  test("admin can bulk approve multiple users", async ({ page }) => {
    await page.goto("/dashboard/users");

    // Filter to show only pending users
    await page.click('button:has-text("Filter by status")');
    await page.click('text="Pending"');

    // Select multiple users
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(1).click(); // First row
    await checkboxes.nth(2).click(); // Second row

    // Click bulk approve
    await page.click('button:has-text("Bulk Approve")');

    // Confirm in dialog
    await expect(page.getByText(/confirm bulk approval/i)).toBeVisible();
    await page.click('button:has-text("Confirm")');

    // Verify success message
    await expect(page.getByText(/users approved successfully/i)).toBeVisible();
  });

  test("admin can change page size", async ({ page }) => {
    await page.goto("/dashboard/users");

    // Click page size selector
    await page.click('button:has-text("50")'); // Default page size

    // Select different page size
    await page.click('text="25"');

    // Verify page size changed
    await expect(page.getByText("25")).toBeVisible();

    // Verify URL updated
    await expect(page).toHaveURL(/pageSize=25/);
  });

  test("pagination works correctly", async ({ page }) => {
    await page.goto("/dashboard/users");

    // Verify pagination controls
    const nextButton = page.locator('button[aria-label="Go to next page"]');
    const prevButton = page.locator('button[aria-label="Go to previous page"]');

    // Check if next button is enabled (depends on data)
    if (await nextButton.isEnabled()) {
      await nextButton.click();

      // Verify page changed
      await expect(page.getByText(/page 2 of/i)).toBeVisible();

      // Verify previous button is now enabled
      await expect(prevButton).toBeEnabled();
    }
  });

  test("keyboard navigation works", async ({ page }) => {
    await page.goto("/dashboard/users");

    // Tab through interactive elements
    await page.keyboard.press("Tab"); // Search input
    await expect(
      page.locator('input[placeholder="Filter emails..."]')
    ).toBeFocused();

    await page.keyboard.press("Tab"); // Status filter
    await page.keyboard.press("Tab"); // First checkbox (if visible)
    await page.keyboard.press("Tab"); // First approve button (if visible)

    // Verify focus management
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("error handling works correctly", async ({ page }) => {
    await page.goto("/dashboard/users");

    // Simulate network error by intercepting requests
    await page.route("/api/users/approve", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    // Try to approve a user
    const approveButton = page.locator('button:has-text("Approve")').first();
    if (await approveButton.isVisible()) {
      await approveButton.click();

      // Verify error message
      await expect(page.getByText(/error/i)).toBeVisible();
    }
  });

  test("responsive design works on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/dashboard/users");

    // Verify table is scrollable
    const table = page.getByRole("table");
    await expect(table).toBeVisible();

    // Verify buttons are touch-friendly
    const approveButton = page.locator('button:has-text("Approve")').first();
    if (await approveButton.isVisible()) {
      const boundingBox = await approveButton.boundingBox();
      expect(boundingBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target
    }
  });
});
