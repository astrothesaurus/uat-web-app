const { test, expect } = require("@playwright/test");

test("Sorting functionality test", async ({ page }) => {
  await page.goto("/sort/");

  const optionsLength = await page.$eval("select#opts", el => el.options.length);
  expect(optionsLength).toBeGreaterThan(1);
});