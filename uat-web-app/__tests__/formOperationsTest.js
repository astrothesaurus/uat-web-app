const {
    buildBody,
    openEmail,
    openOutlook,
    openGmail,
    downloadEML
} = require("../static/js/sorting/formOperations.js");

describe("Form Operations", () => {
    test("should build email body with correct format", () => {
        const name = "Test User";
        const inst = "Test Institution";
        const urnotes = "Test notes";
        const diffStr = "Differences in tree structure";

        const expectedBody = `Name: ${name}\nInstitution: ${inst}\nNotes: ${urnotes}\n\nDifference File:\n${diffStr}`;
        const body = buildBody(name, inst, urnotes, diffStr);

        expect(body).toBe(expectedBody);
    });

    test("should open email client with correct parameters", () => {
        document.body.innerHTML = '<textarea id="notes"></textarea>';
        document.getElementById("notes").value = "Test notes";

        global.getOrig = jest.fn().mockReturnValue({ name: "Original Tree" });
        global.getRoot = jest.fn().mockReturnValue({ name: "Current Tree" });
        global.difftree = jest.fn().mockReturnValue("Differences in tree structure");

        const originalLocation = window.location;
        delete window.location;
        window.location = { href: "" };

        openEmail();

        expect(window.location.href).toContain("mailto:");

        window.location = originalLocation; // Restore after test
    });

    test("should open Outlook with correct parameters", () => {
        document.body.innerHTML = '<textarea id="notes"></textarea>';
        document.getElementById("notes").value = "Test notes";

        global.getOrig = jest.fn().mockReturnValue({ name: "Original Tree" });
        global.getRoot = jest.fn().mockReturnValue({ name: "Current Tree" });
        global.difftree = jest.fn().mockReturnValue("Differences in tree structure");

        const openSpy = jest.fn();
        window.open = openSpy;

        openOutlook();

        expect(openSpy).toHaveBeenCalledWith(expect.stringContaining("outlook.office.com"), '_blank');
    });

    test("should open Gmail with correct parameters", () => {
        document.body.innerHTML = '<textarea id="notes"></textarea>';
        document.getElementById("notes").value = "Test notes";

        global.getOrig = jest.fn().mockReturnValue({ name: "Original Tree" });
        global.getRoot = jest.fn().mockReturnValue({ name: "Current Tree" });
        global.difftree = jest.fn().mockReturnValue("Differences in tree structure");

        const openSpy = jest.fn();
        window.open = openSpy;

        openGmail();

        expect(openSpy).toHaveBeenCalledWith(expect.stringContaining("mail.google.com"), '_blank');

    });

    test("should download EML file with correct content", () => {
        document.body.innerHTML = '<textarea id="notes"></textarea>';
        document.getElementById("notes").value = "Test notes";

        global.getOrig = jest.fn().mockReturnValue({ name: "Original Tree" });
        global.getRoot = jest.fn().mockReturnValue({ name: "Current Tree" });
        global.difftree = jest.fn().mockReturnValue("Differences in tree structure");

        const anchor = document.createElement('a');
        jest.spyOn(anchor, 'click').mockImplementation(() => {});
        jest.spyOn(anchor, 'setAttribute').mockImplementation(() => {});

        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(anchor);

        global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = jest.fn();

        downloadEML();

        expect(createElementSpy).toHaveBeenCalledWith('a');
    });

});