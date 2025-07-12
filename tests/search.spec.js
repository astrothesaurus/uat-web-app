const {test, expect} = require("@playwright/test");

test("Search functionality test", async ({ page }) => {
    await page.goto("/uat/?view=search");

    await page.locator('input[name="lookup"]').fill("galaxy");
    await page.locator('input[type="submit"]').click();

    await expect(page).toHaveURL(/\/uat\/\?view=search&lookup=galaxy&sort=alpha/);
});