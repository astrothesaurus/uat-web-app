/**
 * Compares two tree maps and generates a diff output.
 * @param {Object} map1 - The first tree map.
 * @param {Object} map2 - The second tree map.
 * @param {string} prefix - The prefix to use for the diff output.
 * @returns {string} - The diff output.
 */
function compareTrees(map1, map2, prefix) {
    let diffout = "";
    Object.keys(map1).forEach(parent => {
        if (!map2[parent]) {
            diffout += `${prefix}${parent}\n`;
            Object.keys(map1[parent]).forEach(child => {
                diffout += `${prefix}${parent} NT ${child}\n`;
            });
        } else {
            Object.keys(map1[parent]).forEach(child => {
                if (!map2[parent][child]) {
                    diffout += `${prefix}${parent} NT ${child}\n`;
                }
            });
        }
    });
    return diffout;
}

/**
 * Flattens a tree structure into a map.
 * @param {Object} tree - The tree to flatten.
 * @param {Object} treeMap - The map to store the flattened tree.
 */
function flattenTree(tree, treeMap) {
    if (!treeMap[tree.name]) {
        treeMap[tree.name] = {};
    }
    if (tree.children) {
        tree.children.forEach(child => {
            treeMap[tree.name][child.name] = 1;
            flattenTree(child, treeMap);
        });
    }
    if (tree._children) {
        tree._children.forEach(child => {
            treeMap[tree.name][child.name] = 1;
            flattenTree(child, treeMap);
        });
    }
}

/**
 * Generates a diff output between two trees.
 * @param {Object} tree1 - The first tree to compare.
 * @param {Object} tree2 - The second tree to compare.
 * @returns {string} - The diff output.
 */
function difftree(tree1, tree2) {
    let diffout = "";
    let tree1Map = {};
    let tree2Map = {};

    // Flatten both trees into maps
    flattenTree(tree1, tree1Map);
    flattenTree(tree2, tree2Map);

    // Compare tree1 with tree2
    diffout += compareTrees(tree1Map, tree2Map, '-');
    // Compare tree2 with tree1
    diffout += compareTrees(tree2Map, tree1Map, '%2B');

    return diffout;
}

try {
    module.exports = {
        compareTrees,
        flattenTree,
        difftree
    };
} catch {
    // Do Nothing. This is only for tests
}