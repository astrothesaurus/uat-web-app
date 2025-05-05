// tests/homepage.spec.js
const {test, expect} = require("@playwright/test");

test("homepage tests", async ({ page }) => {
    await page.goto("/");

    // Check homepage title
    expect(await page.title()).toBe("UAT Web Apps");

    // Check homepage welcome text
    const welcomeText = await page.locator(".h2").textContent();
    expect(welcomeText).toContain("UAT Web Apps Home Page");

    // Check homepage list items
    const listItems = await page.locator("li").allTextContents();
    expect(listItems).toEqual([
        "UAT Sorting Tool",
        "UAT Alphabetical Browser",
        "UAT Hierarchical Browser",
        "Search the UAT"
    ]);
});