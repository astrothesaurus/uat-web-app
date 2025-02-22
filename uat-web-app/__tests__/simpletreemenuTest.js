const {JSDOM} = require('jsdom');
const fs = require('fs');
const path = require('path');
const ddtreemenu = require('../static/js/simpletreemenu.js').ddtreemenu;

describe('ddtreemenu', () => {
    let window, document;

    beforeAll(() => {
        const html = fs.readFileSync(path.resolve(__dirname, '../templates/index.html'), 'utf8');
        const dom = new JSDOM(html, {runScripts: 'dangerously'});
        window = dom.window;
        document = window.document;
        global.document = document;
        global.window = window;
        global.alert = jest.fn();
    });

    afterAll(() => {
        delete global.document;
        delete global.window;
    });

    test('should build a subtree and set attributes correctly', () => {
        const treeid = 'tree1';
        const ulelement = document.createElement('ul');
        const parentElement = document.createElement('div');
        parentElement.appendChild(ulelement);
        document.body.appendChild(parentElement);
        const index = 0;

        ddtreemenu.buildSubTree(treeid, ulelement, index);

        expect(ulelement.getAttribute('rel')).toBe('closed');
        expect(ulelement.parentNode.className).toBe('submenu');
    });

    test('should expand a subtree and set attributes correctly', () => {
        const treeid = 'tree1';
        const ulelement = document.createElement('ul');
        document.body.appendChild(ulelement);

        ddtreemenu.expandSubTree(treeid, ulelement);

        expect(ulelement.style.display).toBe('block');
        expect(ulelement.getAttribute('rel')).toBe('open');
    });

    test('should set and get cookie correctly', () => {
        const name = 'testCookie';
        const value = 'testValue';
        const days = 1;

        ddtreemenu.setCookie(name, value, days);

        const cookie = ddtreemenu.getCookie(name);
        expect(cookie).toBe(value);
    });

    test('should prevent event propagation', () => {
        const event = new window.Event('click', {bubbles: true});
        const spy = jest.spyOn(event, 'stopPropagation');

        ddtreemenu.preventpropagate(event);

        expect(spy).toHaveBeenCalled();
    });

    test('should find and remove a value from the array', () => {
        const array = [1, 2, 3, 4, 5];
        const value = 3;

        const result = ddtreemenu.searcharray(array, value);

        expect(result).toBe(true);
        expect(array).toEqual([2, 3, 4, 5]);
    });

    test('should return false if the value is not found in the array', () => {
        const array = [1, 2, 3, 4, 5];
        const value = 6;

        const result = ddtreemenu.searcharray(array, value);

        expect(result).toBe(false);
        expect(array).toEqual([1, 2, 3, 4, 5]);
    });

});