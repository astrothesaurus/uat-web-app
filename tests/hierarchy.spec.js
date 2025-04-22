const {test, expect} = require("@playwright/test");

test("Hierarchy view test", async ({page}) => {
    await page.goto("/uat/?view=hierarchy");

    const listLength = await page.$eval("ul#treemenu1", el => el.querySelectorAll("li").length);
    expect(listLength).toBeGreaterThan(1);
});

test("Hierarchy exoplanet test", async ({page}) => {
    await page.goto("/uat/498?view=hierarchy&path=486");

    // Helper function to get and verify text content
    const getTextContent = async (element, selector) => {
        const child = await element.$(selector);
        expect(child).not.toBeNull();
        return await child.innerText();
    };

    // Verify the content div and its paragraph
    const contentDiv = await page.$("#content");
    expect(contentDiv).not.toBeNull();
    const pText = await getTextContent(contentDiv, "p");
    expect(pText).toContain("Exoplanet");

    // Verify the mainstuff section
    const mainstuff = await page.$(".mainstuff");
    expect(mainstuff).not.toBeNull();

    // Verify strong elements
    const strongElements = await mainstuff.$$("strong");
    expect(strongElements).toHaveLength(4);

    const expectedStrongTexts = [
        "Broader Concept",
        "Narrower Concept",
        "Related Concept",
        "Alternate Term",
    ];
    const strongTexts = await Promise.all(
        strongElements.map((el) => el.innerText())
    );
    expectedStrongTexts.forEach((text, index) => {
        expect(strongTexts[index]).toContain(text);
    });

    // Verify definition list (dl) elements
    const dlElements = await mainstuff.$$("dl");
    expect(dlElements).toHaveLength(2);

    // Verify the first dl element (Definition)
    const dtText1 = await getTextContent(dlElements[0], "dt");
    expect(dtText1).toContain("Definition");
    const ddElement = await dlElements[0].$("dd");
    expect(ddElement).not.toBeNull();
    const ddText = await ddElement.innerText();
    expect(ddText).not.toBeNull();
    const citeText = await getTextContent(ddElement, "cite");
    expect(citeText).not.toBeNull();

    // Verify the second dl element (Scope Notes)
    const dtText2 = await getTextContent(dlElements[1], "dt");
    expect(dtText2).toContain("Scope Note");
});