const {test, expect} = require("@playwright/test");

test("Alphabetical index test", async ({page}) => {
    // Navigate to the URL
    await page.goto("/uat/");

    const listLength = await page.$eval("ul.alpha", el => el.querySelectorAll("li").length);

    expect(listLength).toBeGreaterThanOrEqual(26);
});