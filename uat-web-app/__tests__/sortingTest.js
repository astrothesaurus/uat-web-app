const {
    storenewsave,
    getCircularReplacer,
    cleanJSON,
    downloadString,
    savestuff,
    AddNode,
    openAlertModal,
    showConfirmModal,
    showPromptModal
} = require("../static/js/sorting/mainUtils.js");

describe("storenewsave", () => {
    test("should store new save data into localStorage", () => {
        let sortsaves = [];
        let newBranch = {name: "branch1", data: "some data"};
        storenewsave(newBranch, sortsaves);

        expect(sortsaves.length).toBe(1);
        expect(sortsaves[0]).toEqual(newBranch);
    });
});

describe("getCircularReplacer", () => {
    test("should create a circular reference replacer", () => {
        let replacer = getCircularReplacer();
        let obj = {a: 1};
        obj.b = obj;

        let jsonString = JSON.stringify(obj, replacer);
        expect(jsonString).toBe('{"a":1}');
    });
});

describe("cleanJSON", () => {
    test("should clean JSON string by removing unwanted properties", () => {
        let jsonString = '{"name":"node","_children":null,"depth":1,"x":100,"y":200,"x0":50,"y0":50,"id":123}';
        let cleanedString = cleanJSON(jsonString);

        expect(cleanedString).toBe('{"name":"node"}');
    });
});

describe("savestuff", () => {
    test("should save the current state of the tree", () => {
        let sortsaves = [];
        let saveName = "testSave";
        global.getRoot = jest.fn().mockReturnValue({children: [{name: "branch"}, {name: "recycle"}]});
        global.getOrig = jest.fn().mockReturnValue({name: "orig"});
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
});

describe("downloadString", () => {
    test("should generate and download JSON string", () => {
        global.getRoot = jest.fn().mockReturnValue({children: [{name: "branch"}, {name: "recycle"}]});
        global.getOrig = jest.fn().mockReturnValue({name: "orig"});
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

        expect(document.createElement).toHaveBeenCalledWith("a");
        expect(document.body.appendChild).toHaveBeenCalledWith(mockElement);
        expect(mockElement.click).toHaveBeenCalled();
        expect(mockElement.remove).toHaveBeenCalled();
    });
});

describe("AddNode", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="newnode" value="TestNode" />
            <div id="error"></div>
        `;
        global.addNode = jest.fn();
    });

    test("should call addNode with the node name and clear the error div", () => {
        AddNode();

        expect($("#error").html()).toBe(""); // Ensure error div is cleared
        expect(global.addNode).toHaveBeenCalledWith("TestNode", $("#error"));
    });

    test("should not call addNode if nodeName is empty", () => {
        $("#newnode").val(""); // Simulate empty input
        AddNode();

        expect(global.addNode).not.toHaveBeenCalled();
    });
});

describe('openAlertModal', () => {
    beforeEach(() => {
        // Set up the DOM structure required for the test
        document.body.innerHTML = `
            <div id="modal" class="modal"></div>
            <div id="modalBodyContent"></div>
            <div id="confirmModal" class="modal">
                <div id="confirmModalBody"></div>
                <button id="confirmOkButton"></button>
                <button id="confirmCancelButton"></button>
            </div>
        `;
    });

    test('should display the modal and set the message in the modal body', () => {
        const mockMessage = 'Test alert message';

        const mockShow = jest.fn();
        global.bootstrap = {
            Modal: jest.fn(() => ({
                show: mockShow
            }))
        };

        openAlertModal(mockMessage);

        expect(document.getElementById('modalBodyContent').textContent).toBe(mockMessage);
        expect(global.bootstrap.Modal).toHaveBeenCalledWith(document.getElementById('modal'), {
            backdrop: 'static',
            keyboard: false
        });
        expect(mockShow).toHaveBeenCalled();
    });
});

describe('showConfirmModal', () => {
    beforeEach(() => {
        // Set up the DOM structure required for the test
        document.body.innerHTML = `
            <div id="confirmModal" class="modal">
                <div id="confirmModalBody"></div>
                <button id="confirmOkButton"></button>
                <button id="confirmCancelButton"></button>
            </div>
        `;
    });

    test('should display the modal with the correct message and handle OK button click', () => {
        const mockCallback = jest.fn();
        const message = 'Are you sure?';
        const mockShow = jest.fn();
        const mockHide = jest.fn();
        global.bootstrap = {
            Modal: jest.fn(() => ({
                show: mockShow,
                hide: mockHide
            }))
        };
        showConfirmModal(message, mockCallback);

        expect(document.getElementById('confirmModalBody').textContent).toBe(message);

        document.getElementById('confirmOkButton').click();

        expect(mockCallback).toHaveBeenCalledWith(true);
    });

    test('should handle Cancel button click', () => {
        const mockCallback = jest.fn();
        // Mock the bootstrap.Modal class
        const mockShow = jest.fn();
        const mockHide = jest.fn();
        global.bootstrap = {
            Modal: jest.fn(() => ({
                show: mockShow,
                hide: mockHide
            }))
        };
        showConfirmModal('Are you sure?', mockCallback);

        document.getElementById('confirmCancelButton').click();

        expect(mockCallback).toHaveBeenCalledWith(false);
    });
});

describe('showPromptModal', () => {
    beforeEach(() => {
        // Set up the DOM structure required for the test
        document.body.innerHTML = `
            <div id="promptModal" class="modal">
                <div id="promptModalBody"></div>
                <input id="promptInput" />
                <button id="promptOkButton"></button>
                <button id="promptCancelButton"></button>
            </div>
        `;
    });

    test('should display the modal with the correct message and handle OK button click', () => {
        const mockCallback = jest.fn();
        const message = 'Enter your name:';
        const userInput = 'Test User';

        const mockShow = jest.fn();
        const mockHide = jest.fn();
        global.bootstrap = {
            Modal: jest.fn(() => ({
                show: mockShow,
                hide: mockHide
            }))
        };

        showPromptModal(message, mockCallback);

        expect(document.getElementById('promptModalBody').textContent).toBe(message);

        document.getElementById('promptInput').value = userInput;
        document.getElementById('promptOkButton').click();

        expect(mockCallback).toHaveBeenCalledWith(userInput);
        expect(mockHide).toHaveBeenCalled();
    });

    test('should handle Cancel button click', () => {
        const mockCallback = jest.fn();

        const mockShow = jest.fn();
        const mockHide = jest.fn();
        global.bootstrap = {
            Modal: jest.fn(() => ({
                show: mockShow,
                hide: mockHide
            }))
        };

        showPromptModal('Enter your name:', mockCallback);

        document.getElementById('promptCancelButton').click();

        expect(mockCallback).toHaveBeenCalledWith(null);
        expect(mockHide).toHaveBeenCalled();
    });
});