const { difftree, flattenTree, compareTrees } = require('../static/js/difftree');

describe('difftree', () => {
    test('should generate correct diff output between two trees', () => {
        const tree1 = {
            name: 'root',
            children: [
                { name: 'child1' },
                { name: 'child2' }
            ]
        };
        const tree2 = {
            name: 'root',
            children: [
                { name: 'child2' },
                { name: 'child3' }
            ]
        };
        const expectedDiff = '-root NT child1\n-child1\n%2Broot NT child3\n%2Bchild3\n';
        expect(difftree(tree1, tree2)).toBe(expectedDiff);
    });
});

describe('flattenTree', () => {
    test('should flatten tree structure into a map', () => {
        const tree = {
            name: 'root',
            children: [
                { name: 'child1' },
                { name: 'child2' }
            ]
        };
        const expectedMap = {
            root: { child1: 1, child2: 1 },
            child1: {},
            child2: {}
        };
        const treeMap = {};
        flattenTree(tree, treeMap);
        expect(treeMap).toEqual(expectedMap);
    });
});

describe('compareTrees', () => {
    test('should generate correct diff output for tree maps', () => {
        const map1 = {
            root: { child1: 1, child2: 1 },
            child1: {},
            child2: {}
        };
        const map2 = {
            root: { child2: 1, child3: 1 },
            child2: {},
            child3: {}
        };
        expect(compareTrees(map1, map2, '-')).toBe('-root NT child1\n-child1\n');
        expect(compareTrees(map2, map1, '%2B')).toBe('%2Broot NT child3\n%2Bchild3\n');
    });
});