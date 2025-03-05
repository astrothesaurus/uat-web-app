const { test, expect } = require("@playwright/test");

test("Search functionality test", async ({ page }) => {
  await page.goto("http://localhost/uat/?view=search");

  await page.waitForSelector('input[name="lookup"]');

  await page.fill('input[name="lookup"]', "galaxy");

  await page.click('input[type="submit"]');

  expect(page.url()).toBe("http://localhost/uat/?view=search&lookup=galaxy");

});