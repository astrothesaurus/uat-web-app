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
        global.d3 = {
            xhr: jest.fn().mockReturnValue({
                header: jest.fn().mockReturnThis(),
                post: jest.fn()
            })
        };

        document.getElementById = jest.fn((id) => {
            if (id === "first_name") return {value: "John"};
            if (id === "yourinst") return {value: "Institution"};
            if (id === "youremail") return {value: "john@example.com"};
            if (id === "notes") return {value: "Some notes"};
        });

        TestForm();

        expect(global.d3.xhr).toHaveBeenCalledWith("/email");
        expect(global.d3.xhr().header).toHaveBeenCalledWith("Content-Type", "application/x-www-form-urlencoded");
        expect(global.d3.xhr().post).toHaveBeenCalledWith(
            "testarg=Name: John\nInstituion: Institution\nEmail: john@example.com\nNotes: Some notes\n\nDifference File:\ndiff"
        );
    });

});