const {
    storenewsave,
    getCircularReplacer,
    cleanJSON,
    removeSpaces,
    checkform,
    downloadString,
    savestuff,
    ValidCaptcha,
    GenerateCode,
    TestForm
} = require('../static/js/sorting.js');
const fs = require("fs");
const path = require("path");
const {JSDOM} = require("jsdom");

describe('Sorting Tree Tests', () => {
    let window
    beforeAll(() => {
        const html = fs.readFileSync(path.resolve(__dirname, '../templates/index.html'), 'utf8');
        const dom = new JSDOM(html, {runScripts: 'dangerously'});
        window = dom.window;
        global.document = document;
        global.window = window;
        global.alert = jest.fn();
    });
    test('should store new save data into localStorage', () => {
        let sortsaves = [];
        let newBranch = {name: 'branch1', data: 'some data'};
        storenewsave(newBranch, sortsaves);

        expect(sortsaves.length).toBe(1);
        expect(sortsaves[0]).toEqual(newBranch);
    });

    test('should create a circular reference replacer', () => {
        let replacer = getCircularReplacer();
        let obj = {a: 1};
        obj.b = obj;

        let jsonString = JSON.stringify(obj, replacer);
        expect(jsonString).toBe('{"a":1}');
    });

    test('should clean JSON string by removing unwanted properties', () => {
        let jsonString = '{"name":"node","_children":null,"depth":1,"x":100,"y":200,"x0":50,"y0":50,"id":123}';
        let cleanedString = cleanJSON(jsonString);

        expect(cleanedString).toBe('{"name":"node"}');
    });

    test('should remove spaces from a string', () => {
        let stringWithSpaces = 'a b c d e';
        let stringWithoutSpaces = removeSpaces(stringWithSpaces);

        expect(stringWithoutSpaces).toBe('abcde');
    });

    test('should save the current state of the tree', () => {
        let sortsaves = [];
        let saveName = 'testSave';
        global.getRoot = jest.fn().mockReturnValue({children: [{name: 'branch'}, {name: 'recycle'}]});
        global.getOrig = jest.fn().mockReturnValue({name: 'orig'});
        global.flattenTree = jest.fn();
        global.cleanJSON = jest.fn((jsonString) => jsonString);
        global.NewBranchEntry = jest.fn((rootBranch, rootRecycle, rootOrig, saveName) => ({
            rootBranch,
            rootRecycle,
            rootOrig,
            saveName
        }));

        savestuff(saveName, sortsaves);

        expect(sortsaves.length).toBe(1);
        expect(sortsaves[0].saveName).toBe(saveName);
    });

    test('should generate and download JSON string', () => {
        global.getRoot = jest.fn().mockReturnValue({children: [{name: 'branch'}, {name: 'recycle'}]});
        global.getOrig = jest.fn().mockReturnValue({name: 'orig'});
        global.flattenTree = jest.fn();
        global.cleanJSON = jest.fn((jsonString) => jsonString);
        global.getCircularReplacer = jest.fn().mockReturnValue((key, value) => value);

        const mockElement = {
            click: jest.fn(),
            remove: jest.fn(),
            setAttribute: jest.fn()
        };
        document.createElement = jest.fn().mockReturnValue(mockElement);
        document.body.appendChild = jest.fn();

        downloadString();

        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(document.body.appendChild).toHaveBeenCalledWith(mockElement);
        expect(mockElement.click).toHaveBeenCalled();
        expect(mockElement.remove).toHaveBeenCalled();
    });

    test('should not send feedback if captcha is invalid', () => {
        global.getRoot = jest.fn().mockReturnValue({});
        global.ValidCaptcha = jest.fn().mockReturnValue(false); // Ensure ValidCaptcha returns false
        global.TestForm = jest.fn();
        let form = {txtInput: {value: '12345'}};

        let result = checkform(form);

        expect(result).toBe(false);
        expect(global.TestForm).not.toHaveBeenCalled();
    });

    test('should invalidate captcha when entered value is incorrect', () => {
        document.getElementById = jest.fn((id) => {
            if (id === 'txtCaptcha') return {value: '12345'};
            if (id === 'txtInput') return {value: '54321'}; // Different value to ensure invalidation
        });

        let result = ValidCaptcha();

        expect(result).toBe(false);
    });

    test('should generate unique captcha codes', () => {
        const mockElements = [];
        document.getElementById = jest.fn((id) => {
            if (id === 'txtCaptcha') {
                const element = {value: '', setAttribute: jest.fn()};
                mockElements.push(element);
                return element;
            }
            if (id === 'txtCaptchaDiv') {
                const element = {innerHTML: ''};
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

    test('should send form data and tree differences via HTTP POST request', () => {
        global.getRoot = jest.fn().mockReturnValue({}); // Mock getRoot function
        global.getOrig = jest.fn().mockReturnValue({}); // Mock getOrig function
        global.difftree = jest.fn().mockReturnValue('diff'); // Mock difftree function
        global.d3 = {
            xhr: jest.fn().mockReturnValue({
                header: jest.fn().mockReturnThis(),
                post: jest.fn()
            })
        };

        document.getElementById = jest.fn((id) => {
            if (id === 'first_name') return {value: 'John'};
            if (id === 'yourinst') return {value: 'Institution'};
            if (id === 'youremail') return {value: 'john@example.com'};
            if (id === 'notes') return {value: 'Some notes'};
        });

        TestForm();

        expect(global.d3.xhr).toHaveBeenCalledWith('/email');
        expect(global.d3.xhr().header).toHaveBeenCalledWith('Content-Type', 'application/x-www-form-urlencoded');
        expect(global.d3.xhr().post).toHaveBeenCalledWith(
            'testarg=Name: John\nInstituion: Institution\nEmail: john@example.com\nNotes: Some notes\n\nDifference File:\ndiff'
        );
    });

});