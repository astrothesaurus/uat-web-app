const ddtreemenu = require("../static/js/simpletreemenu.js").ddtreemenu;

describe("Subtree Operations", () => {
    test("should build a subtree and set attributes correctly", () => {
        const treeid = "tree1";
        const ulelement = document.createElement("ul");
        const parentElement = document.createElement("div");
        parentElement.appendChild(ulelement);
        document.body.appendChild(parentElement);
        const index = 0;

        ddtreemenu.buildSubTree(treeid, ulelement, index);

        expect(ulelement.getAttribute("rel")).toBe("closed");
        expect(ulelement.parentNode.className).toBe("submenu");
    });

    test('should expand subtree when rel attribute is "open"', () => {
        const treeid = 'tree1';
        const ulelement = document.createElement('ul');
        ulelement.setAttribute('rel', 'open');
        const parentElement = document.createElement('div');
        parentElement.appendChild(ulelement);
        document.body.appendChild(parentElement);
        const index = 0;

        jest.spyOn(ddtreemenu, 'expandSubTree');

        ddtreemenu.buildSubTree(treeid, ulelement, index);

        expect(ddtreemenu.expandSubTree).toHaveBeenCalledWith(treeid, ulelement);
    });

    test("should expand a subtree and set attributes correctly", () => {
        const treeid = "tree1";
        const ulelement = document.createElement("ul");
        document.body.appendChild(ulelement);

        ddtreemenu.expandSubTree(treeid, ulelement);

        expect(ulelement.style.display).toBe("block");
        expect(ulelement.getAttribute("rel")).toBe("open");
    });
});

describe("Cookie Management", () => {
    test("should set and get cookie correctly", () => {
        const name = "testCookie";
        const value = "testValue";
        const days = 1;

        ddtreemenu.setCookie(name, value, days);

        const cookie = ddtreemenu.getCookie(name);
        expect(cookie).toBe(value);
    });

    test("should get empty cookie when not exist", () => {
        const cookie = ddtreemenu.getCookie("unknownCookie");
        expect(cookie).toBe("");
    });

    test("should store the state of open UL elements in a cookie", () => {
        const treeid = "tree1";
        const tree = document.createElement("div");
        tree.id = treeid;

        const ul1 = document.createElement("ul");
        ul1.setAttribute("rel", "open");
        tree.appendChild(ul1);

        const ul2 = document.createElement("ul");
        ul2.setAttribute("rel", "closed");
        tree.appendChild(ul2);

        document.body.appendChild(tree);

        ddtreemenu.rememberstate(treeid, 1);

        const cookie = ddtreemenu.getCookie(treeid);
        expect(cookie).toBe("0");
    });

    test("should store 'none open' in the cookie if no UL elements are open", () => {
        const treeid = "tree2";
        const tree = document.createElement("div");
        tree.id = treeid;

        const ul1 = document.createElement("ul");
        ul1.setAttribute("rel", "closed");
        tree.appendChild(ul1);

        const ul2 = document.createElement("ul");
        ul2.setAttribute("rel", "closed");
        tree.appendChild(ul2);

        document.body.appendChild(tree);

        ddtreemenu.rememberstate(treeid, 1);

        const cookie = ddtreemenu.getCookie(treeid);
        expect(cookie).toBe("none open");
    });
});

describe("Event Handling", () => {
    test("should prevent event propagation", () => {
        const event = new window.Event("click", {bubbles: true});
        const spy = jest.spyOn(event, "stopPropagation");

        ddtreemenu.preventpropagate(event);

        expect(spy).toHaveBeenCalled();
    });

    test("should add an event listener to the target element", () => {
        const mockTarget = {
            addEventListener: jest.fn(),
            attachEvent: jest.fn(),
        };
        const mockFunction = jest.fn();
        const taskType = "click";

        ddtreemenu.dotask(mockTarget, mockFunction, taskType);
        expect(mockTarget.addEventListener).toHaveBeenCalledWith(taskType, mockFunction, false);

        mockTarget.addEventListener = undefined;
        ddtreemenu.dotask(mockTarget, mockFunction, taskType);
        expect(mockTarget.attachEvent).toHaveBeenCalledWith("click", mockFunction);
    });
});

describe("Array Operations", () => {
    test("should find and remove a value from the array", () => {
        const array = [1, 2, 3, 4, 5];
        const value = 3;

        const result = ddtreemenu.searcharray(array, value);

        expect(result).toBe(true);
        expect(array).toEqual([2, 3, 4, 5]);
    });

    test("should return false if the value is not found in the array", () => {
        const array = [1, 2, 3, 4, 5];
        const value = 6;

        const result = ddtreemenu.searcharray(array, value);

        expect(result).toBe(false);
        expect(array).toEqual([1, 2, 3, 4, 5]);
    });
});

describe("Tree Initialization", () => {
    beforeEach(() => {
        document.cookie = "";
        document.body.innerHTML = "";
    });

    test("should initialize a tree menu and build subtrees", () => {
        const treeid = "tree1";
        const tree = document.createElement("div");
        tree.id = treeid;

        const ul1 = document.createElement("ul");
        const ul2 = document.createElement("ul");
        tree.appendChild(ul1);
        tree.appendChild(ul2);

        document.body.appendChild(tree);

        ddtreemenu.createTree(treeid, false, 1);

        expect(ul1.getAttribute("rel")).toBe("closed");
        expect(ul2.getAttribute("rel")).toBe("closed");
        expect(ul1.parentNode.className).toBe("submenu");
        expect(ul2.parentNode.className).toBe("submenu");
    });

    test("should persist state if enablepersist is true", () => {
        const treeid = "tree2";
        const tree = document.createElement("div");
        tree.id = treeid;

        const ul1 = document.createElement("ul");
        ul1.setAttribute("rel", "open");
        const ul2 = document.createElement("ul");
        ul2.setAttribute("rel", "closed");
        tree.appendChild(ul1);
        tree.appendChild(ul2);

        document.body.appendChild(tree);

        ddtreemenu.createTree(treeid, true, 1);

        window.dispatchEvent(new Event("unload"));

        const cookie = ddtreemenu.getCookie(treeid);
        expect(cookie).toBe("none open");
    });
});

describe("Flatten Operations", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    test("should expand all UL elements and set attributes to 'open'", () => {
        const treeid = "tree1";
        const tree = document.createElement("div");
        tree.id = treeid;

        const ul1 = document.createElement("ul");
        const ul2 = document.createElement("ul");
        tree.appendChild(ul1);
        tree.appendChild(ul2);

        document.body.appendChild(tree);

        ddtreemenu.flatten(treeid, "expand");

        expect(ul1.style.display).toBe("block");
        expect(ul1.getAttribute("rel")).toBe("open");
        expect(ul2.style.display).toBe("block");
        expect(ul2.getAttribute("rel")).toBe("open");
    });

    test("should contract all UL elements and set attributes to 'closed'", () => {
        const treeid = "tree1";
        const tree = document.createElement("div");
        tree.id = treeid;

        const ul1 = document.createElement("ul");
        const ul2 = document.createElement("ul");
        tree.appendChild(ul1);
        tree.appendChild(ul2);

        document.body.appendChild(tree);

        ddtreemenu.flatten(treeid, "contract");

        expect(ul1.style.display).toBe("none");
        expect(ul1.getAttribute("rel")).toBe("closed");
        expect(ul2.style.display).toBe("none");
        expect(ul2.getAttribute("rel")).toBe("closed");
    });
});