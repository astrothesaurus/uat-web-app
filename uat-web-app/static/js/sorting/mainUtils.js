var savefile;

class NewBranchEntry {
    constructor(rootBranch, rootRecycle, rootOrig, saveName) {
        this.rootBranch = rootBranch;
        this.rootRecycle = rootRecycle;
        this.rootOrig = rootOrig;
        this.saveName = saveName;
    }
}

/**
 * Creates a circular reference replacer for JSON.stringify.
 * @returns {Function} - The replacer function.
 */
let getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};

/**
 * Cleans JSON string by removing unwanted properties.
 * @param {string} jsonString - The JSON string to clean.
 * @returns {string} - The cleaned JSON string.
 */
function cleanJSON(jsonString) {
    return jsonString.replace(/_children/gm, "children")
        .replace(/,"children":null/gm, "")
        .replace(/,"depth":\d*/gm, "")
        .replace(/,"x":\d*.\d*,"y":\d*/gm, "")
        .replace(/,"x0":\d*.\d*,"y0":\d*/gm, "")
        .replace(/,"id":\d*/gm, "");
}

/**
 * Stores new save data into browser localStorage.
 * @param {Object} newBranch - The new branch data to save.
 * @param {Array} sortsaves - The array of saved data.
 */
function storenewsave(newBranch, sortsaves) {
    sortsaves.push(newBranch);
    let jsonBranches = JSON.stringify(sortsaves);
    window.localStorage.setItem(savefile, jsonBranches);
}

/**
 * Saves the current state of the tree.
 * @param {string} saveName - The name of the save file.
 * @param {Array} sortsaves - The array of saved data.
 */
function savestuff(saveName, sortsaves) {
    let root = getRoot();
    let orig = getOrig();
    flattenTree(root, {});

    let branch, recycle, root1, recycle1;
    for (let i = 0; i < root["children"].length; i++) {
        delete root["children"][i]["parent"];

        if (root["children"][i]["name"] === "recycle" || root["children"][i]["name"] === "orphan") {
            recycle = {"name": "recycle", "children": root["children"][i]};
            recycle1 = JSON.stringify(recycle, getCircularReplacer());
        } else {
            branch = {"name": "branch", "children": root["children"][i]};
            root1 = JSON.stringify(branch, getCircularReplacer());
        }
    }

    let orig1 = {"name": "orig", "children": orig};
    let rootBranch = cleanJSON(root1);
    let rootRecycle = cleanJSON(recycle1);
    let rootOrig = JSON.stringify(orig1);

    let newBranch = new NewBranchEntry(rootBranch, rootRecycle, rootOrig, saveName);
    storenewsave(newBranch, sortsaves);
}

/**
 * Adds a new node to the tree.
 */
function AddNode() {
    let nodeName = $("#newnode").val();
    let errorDiv = $("#error");
    errorDiv.empty();
    if (nodeName) {
        addNode(nodeName, errorDiv);
    }
}

/**
 * Downloads the current tree structure as a JSON file.
 */
function downloadString() {
    let root = getRoot();
    let orig = getOrig();
    flattenTree(root, {});

    let branch, recycle;
    for (let i = 0; i < root["children"].length; i++) {
        delete root["children"][i]["parent"];

        if (root["children"][i]["name"] === "recycle") {
            recycle = {"name": "recycle", "children": root["children"][i]};
        } else {
            branch = {"name": "branch", "children": root["children"][i]};
        }
    }

    let orig1 = {"name": "orig", "children": orig};
    let section = {
        "name": "root",
        "children": [
            {"name": "branch", "children": branch["children"]},
            {"name": "recycle", "children": recycle["children"]},
            {"name": "orig", "children": orig1["children"]}
        ]
    };

    let exportjson = cleanJSON(JSON.stringify(section, getCircularReplacer()));
    let file = "data:text/plain;charset=utf-8," + encodeURIComponent(exportjson);
    let a = document.createElement("a");
    a.href = file;
    a.target = "_blank";
    a.download = "export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function openAlertModal(message) {
    let myModal = new bootstrap.Modal(document.getElementById("modal"), {
        backdrop: 'static',
        keyboard: false
    });
    document.getElementById("modalBodyContent").textContent = message;
    myModal.show();
}

function showConfirmModal(message, callback) {
    // Update the modal body text
    document.getElementById("confirmModalBody").textContent = message;

    // Show the modal
    let confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"), {
        backdrop: 'static',
        keyboard: false
    });
    confirmModal.show();

    // Handle the OK button click
    document.getElementById("confirmOkButton").onclick = function () {
        callback(true);
        confirmModal.hide();
    };

    // Handle the Cancel button click
    document.getElementById("confirmCancelButton").onclick = function () {
        callback(false);
        confirmModal.hide();
    };
}

function showPromptModal(message, callback) {
    // Update the modal body text
    document.getElementById("promptModalBody").textContent = message;

    // Show the modal
    let promptModal = new bootstrap.Modal(document.getElementById("promptModal"), {
        backdrop: 'static',
        keyboard: false
    });
    promptModal.show();

    // Handle the OK button click
    document.getElementById("promptOkButton").onclick = function () {
        const userInput = document.getElementById("promptInput").value;
        callback(userInput);
        promptModal.hide();
    };

    // Handle the Cancel button click
    document.getElementById("promptCancelButton").onclick = function () {
        callback(null);
        promptModal.hide();
    };
}

try {
    module.exports = {
        cleanJSON,
        downloadString,
        savestuff,
        getCircularReplacer,
        storenewsave,
        AddNode,
        openAlertModal,
        showConfirmModal,
        showPromptModal
    };
} catch {
    // Do Nothing. This is only for tests
}