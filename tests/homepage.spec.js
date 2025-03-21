// tests/homepage.spec.js
const { test, expect } = require("@playwright/test");

test("homepage tests", async ({ page }) => {
    await test.step("Check homepage title", async () => {
        await page.goto("/");
        const title = await page.title();
        expect(title).toBe("UAT Web Apps");
    });

    await test.step("Check homepage welcome text", async () => {
        await page.goto("/");
        const welcomeText = await page.textContent(".h2");
        expect(welcomeText).toContain("UAT Web Apps Home Page");
    });

    await test.step("Check homepage list items", async () => {
        await page.goto("/");
        const listItems = await page.$$eval("li", items => items.map(item => item.textContent.trim()));
        expect(listItems).toEqual([
            "UAT Sorting Tool",
            "UAT Alphabetical Browser",
            "UAT Hierarchical Browser",
            "Search the UAT"
        ]);
    });
});