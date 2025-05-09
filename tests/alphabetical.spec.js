const {test, expect} = require("@playwright/test");

test("Alphabetical index contains at least 26 items", async ({ page }) => {
    await page.goto("/uat/");

    const listLength = await page.locator("ul.alpha li").count();
    expect(listLength).toBeGreaterThanOrEqual(26);
});