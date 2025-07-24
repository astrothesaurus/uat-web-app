// uat-web-app/__tests__/alphaTest.js
const {
    handleTabClick,
    scrollToLetter,
    getlink,
    checkInput,
    clearSearchForm,
    formatExportedData,
    exportResults,
    setFormFromUrl
} = require("../static/js/alpha");

describe("Alpha page Functions", () => {
    beforeEach(() => {
        // Reset DOM before each test
        document.body.innerHTML = "";
        // Remove global resultsData if set
        if (global.resultsData) delete global.resultsData;
    });

    test("getlink should return a valid link", () => {
        document.body.innerHTML = '<a id="-test" href="/foo/test"></a>';
        const result = getlink("test");
        expect(result).toBe("/foo/test");
    });

    test("checkInput should validate input correctly", () => {
        document.body.innerHTML = `
            <input id="uatlookup" value="">
            <button id="searchButton" disabled></button>
        `;
        // Empty input disables button
        checkInput();
        expect(document.getElementById("searchButton").disabled).toBe(true);

        // Non-empty input enables button
        document.getElementById("uatlookup").value = "validInput";
        checkInput();
        expect(document.getElementById("searchButton").disabled).toBe(false);
    });

    test("clearSearchForm should clear the form fields", () => {
        document.body.innerHTML = `
            <input id="uatlookup" value="test">
            <select id="sortOrder"><option value="relevance"></option><option value="other"></option></select>
            <button id="searchButton"></button>
        `;
        document.getElementById("sortOrder").value = "other";
        document.getElementById("searchButton").disabled = false;
        clearSearchForm();
        expect(document.getElementById("uatlookup").value).toBe("");
        expect(document.getElementById("sortOrder").value).toBe("relevance");
        expect(document.getElementById("searchButton").disabled).toBe(true);
    });

    test("formatExportedData should format data correctly", () => {
        const data = [{name: "Test"}];
        const formattedData = formatExportedData(data);
        expect(formattedData).toBeDefined();
        expect(formattedData.length).toBe(1);
        expect(formattedData[0].prefLabel).toBe("Test");
    });

    test("exportResults should trigger download", () => {
        global.resultsData = [{name: "Test", uri: "test-uri", altNames: ["alt1", "alt2"]}];

        const a = document.createElement("a");
        jest.spyOn(a, "click");
        const removeChildSpy = jest.spyOn(document.body, "removeChild");

        const origCreateElement = document.createElement;
        document.createElement = jest.fn(() => a);

        exportResults();

        expect(document.createElement).toHaveBeenCalledWith("a");
        expect(a.click).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalledWith(a);

        document.createElement = origCreateElement;
        removeChildSpy.mockRestore();
    });

    test("setFormFromUrl should set form values from URL parameters", () => {
        window.history.pushState({}, '', '?lookup=testval&sort=other');
        document.body.innerHTML = `
        <input id="uatlookup" value="">
        <select id="sortOrder"><option value="relevance"></option><option value="other"></option></select>
        <button id="searchButton"></button>
    `;
        setFormFromUrl();
        expect(document.getElementById("uatlookup").value).toBe("testval");
        expect(document.getElementById("sortOrder").value).toBe("other");
    });

    test("should deactivate tab and content when already active", () => {
        document.body.innerHTML = `
            <div class="alpha-tab active" aria-selected="true"></div>
            <div id="alpha" class="active"></div>
        `;
        // Simulate event object
        const event = new Event("click");
        event.preventDefault = jest.fn();
        event.stopPropagation = jest.fn();
        // Patch global event
        global.event = event;

        handleTabClick("alpha", "hierarchy", "search", ".alpha-tab", "#alpha");

        expect(document.querySelector(".alpha-tab").classList.contains("active")).toBe(false);
        expect(document.querySelector(".alpha-tab").getAttribute("aria-selected")).toBe("false");
        expect(document.querySelector("#alpha").classList.contains("active")).toBe(false);
    });

    test("should scroll to letter and focus", () => {
        document.body.innerHTML = `
            <div id="A"></div>
            <div id="uatSideBar"></div>
            <div id="letterA" tabindex="0"></div>
        `;
        window.STICKY_TAB_HEIGHT = 48;
        document.getElementById('uatSideBar').scrollTop = 100;
        document.getElementById('letterA').focus = jest.fn();
        document.getElementById('A').scrollIntoView = jest.fn();

        scrollToLetter("A");
        expect(document.getElementById("A").scrollIntoView).toHaveBeenCalledWith(true);
        expect(document.getElementById("uatSideBar").scrollTop).toBe(52);
        expect(document.getElementById("letterA").focus).toHaveBeenCalled();
    });
});