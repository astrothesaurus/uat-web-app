const { test, expect } = require("@playwright/test");

test("Hierarchy view test", async ({ page }) => {
  await page.goto("/uat/?view=hierarchy");

  const listLength = await page.$eval("ul#treemenu1", el => el.querySelectorAll("li").length);
  expect(listLength).toBeGreaterThan(1);
});