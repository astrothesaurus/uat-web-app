const {
    checkform,
    TestForm
} = require("../static/js/sorting/formOperations.js");

describe("Form Operations", () => {
    beforeAll(() => {
        global.openAlertModal = jest.fn(); // Mock openAlertModal function
    });

    test("should not send feedback if captcha is invalid", () => {
        global.getRoot = jest.fn().mockReturnValue({});
        global.ValidCaptcha = jest.fn().mockReturnValue(false); // Ensure ValidCaptcha returns false
        global.TestForm = jest.fn();
        let form = {txtInput: {value: "12345"}};

        let result = checkform(form);

        expect(result).toBe(false);
        expect(global.TestForm).not.toHaveBeenCalled();
        expect(global.openAlertModal).toHaveBeenCalled();
    });

    test("should send form data and tree differences via HTTP POST request", () => {
        global.getRoot = jest.fn().mockReturnValue({}); // Mock getRoot function
        global.getOrig = jest.fn().mockReturnValue({}); // Mock getOrig function
        global.difftree = jest.fn().mockReturnValue("diff"); // Mock difftree function

        document.getElementById = jest.fn((id) => {
            if (id === "first_name") return {value: "John"};
            if (id === "yourinst") return {value: "Institution"};
            if (id === "youremail") return {value: "john@example.com"};
            if (id === "notes") return {value: "Some notes"};
        });

        delete window.location;
        window.location = { href: "" };

        TestForm();

        expect(window.location.href).toMatch(/^mailto:/);
    });

});