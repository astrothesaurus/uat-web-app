const {
    removeSpaces,
    ValidCaptcha,
    GenerateCode
} = require("../static/js/sorting/captchaOperations.js");
const fs = require("fs");
const path = require("path");
const {JSDOM} = require("jsdom");

describe("Sorting Tree Tests", () => {
    let window
    beforeAll(() => {
        const html = fs.readFileSync(path.resolve(__dirname, "../templates/index.html"), "utf8");
        const dom = new JSDOM(html, {runScripts: "dangerously"});
        window = dom.window;
        global.document = document;
        global.window = window;
        global.alert = jest.fn();
    });

    test("should remove spaces from a string", () => {
        let stringWithSpaces = "a b c d e";
        let stringWithoutSpaces = removeSpaces(stringWithSpaces);

        expect(stringWithoutSpaces).toBe("abcde");
    });

    test("should invalidate captcha when entered value is incorrect", () => {
        document.getElementById = jest.fn((id) => {
            if (id === "txtCaptcha") return {value: "12345"};
            if (id === "txtInput") return {value: "54321"}; // Different value to ensure invalidation
        });

        let result = ValidCaptcha();

        expect(result).toBe(false);
    });

    test("should generate unique captcha codes", () => {
        const mockElements = [];
        document.getElementById = jest.fn((id) => {
            if (id === "txtCaptcha") {
                const element = {value: "", setAttribute: jest.fn()};
                mockElements.push(element);
                return element;
            }
            if (id === "txtCaptchaDiv") {
                const element = {innerHTML: ""};
                mockElements.push(element);
                return element;
            }
        });

        const generatedCodes = new Set();

        for (let i = 0; i < 10; i++) {
            GenerateCode();
            const captchaValue = mockElements[i * 2].value; // Access the correct mock element
            generatedCodes.add(captchaValue);
        }

        expect(generatedCodes.size).toBe(10); // Ensure all generated codes are unique
    });

});