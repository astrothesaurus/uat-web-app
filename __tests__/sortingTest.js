const {
    storenewsave,
    getCircularReplacer,
    cleanJSON,
    downloadString,
    savestuff
} = require('../static/js/sorting/main.js');
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

});