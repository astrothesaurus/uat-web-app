const {test, expect} = require("@playwright/test");

test("Sorting functionality test", async ({ page }) => {
    await page.goto("/sort/");

    const optionsLength = await page.locator("select#opts option").count();
    expect(optionsLength).toBeGreaterThan(1);
});