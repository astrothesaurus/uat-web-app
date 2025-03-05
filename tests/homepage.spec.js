// tests/homepage.spec.js
const { test, expect } = require("@playwright/test");

test("homepage has correct title", async ({ page }) => {
    await page.goto("http://localhost");
    const title = await page.title();
    expect(title).toBe("UAT Web Apps");
});

test("homepage contains welcome text", async ({ page }) => {
    await page.goto("http://localhost");
    const welcomeText = await page.textContent(".h2");
    expect(welcomeText).toContain("UAT Web Apps Home Page");
});

test("homepage contains 4 specific list items", async ({ page }) => {
    await page.goto("http://localhost");
    const listItems = await page.$$eval("li", items => items.map(item => item.textContent.trim()));
    expect(listItems).toEqual([
        "UAT Sorting Tool",
        "UAT Alphabetical Browser",
        "UAT Hierarchical Browser",
        "Search the UAT"
    ]);
});