// tests/homepage.spec.js
const { test, expect } = require("@playwright/test");

test("homepage has correct title", async ({ page }) => {
    await page.goto("http://localhost");
    const title = await page.title();
    expect(title).toBe("UAT Web Apps");
});