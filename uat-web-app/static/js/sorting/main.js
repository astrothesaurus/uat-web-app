let savefile;
class NewBranchEntry {
    constructor(rootBranch, rootRecycle, rootOrig, saveName) {
        this.rootBranch = rootBranch;
        this.rootRecycle = rootRecycle;
        this.rootOrig = rootOrig;
        this.saveName = saveName;
    }
}
(function ($) {
    $(document).ready(function () {
        $('#browsebutton').val('');
        $('#opts').val('blank');
        $('#loadbutton').prop('disabled', true);

        // Load previously saved work
        let sortsaves = JSON.parse(localStorage.getItem(savefile)) || [];
        let savelist = [];

        // Populate the dropdown menu with saved file names
        if (sortsaves.length > 0) {
            if ($("#nosave").length > 0) {
                $("#nosave").remove();
                $("#saveopts").append($("<option></option>").val("blank").text(" "));
            }

            sortsaves.forEach(save => {
                let load_name = save["saveName"];
                savelist.push(load_name);
                $("#saveopts").append($("<option></option>").val(load_name).attr("id", "save-" + load_name).text(load_name));
            });
        }

        // Toggle left side panel
        $("#closeleft").on("click", function () {
            $("#leftside, #openleft").toggle();
            $("#feedback, #hidebutton").hide();
            $("#showbutton, #title").show();
        });

        $("#openleft").on("click", function () {
            $("#leftside, #openleft").toggle();
            $("#title").hide();
        });

        // Toggle right side panel
        $("#closeright").on("click", function () {
            $("#history, #openright").toggle();
        });

        $("#openright").on("click", function () {
            $("#history, #openright").toggle();
        });

        // Save button functionality
        $("#savebutton").on("click", function () {
            try {
                let root = getRoot();
                let saveName = prompt("Name for save file?");
                if (saveName == null) {
                    alert("Data Not Saved");
                } else if (/^\w+( \w+)*$/.test(saveName)) {
                    if (savelist.includes(saveName)) {
                        alert("Please choose a unique name for your save file!");
                    } else {
                        $('#opts').val("blank");
                        savestuff(saveName, sortsaves);
                        savelist.push(saveName);

                        if ($("#nosave").length > 0) {
                            $("#nosave, #blank").remove();
                            $("#saveopts").append($("<option></option>").val("blank").attr("id", "blank").text(" ").attr("disabled", "disabled"));
                        }

                        $("#saveopts").append($("<option></option>").val(saveName).text(saveName).attr("selected", "selected").attr("id", "save-" + saveName));
                    }
                } else {
                    alert("The save name can only include letters, numbers, spaces, and underscores.");
                }
            } catch (error) {
                console.error("Saving failed: ", error);
                alert("You have nothing to save.");
            }
        });

        // Override button functionality
        $("#overridebutton").on("click", function () {
            let saveName = $("#saveopts").val();
            if (saveName == null || saveName === "blank") {
                alert("You have nothing to save, try 'Save As...'.");
            } else if (confirm("Are you sure you want to save over '" + saveName + "'?")) {
                let match = sortsaves.findIndex(save => save["saveName"] === saveName);
                if (match !== -1) {
                    sortsaves.splice(match, 1);
                    savestuff(saveName, sortsaves);
                }
            }
        });

        // Delete button functionality
        $("#deletebutton").on("click", function () {
            let saveName = $("#saveopts").val();
            if (saveName == null || saveName === 'blank') {
                alert("Please choose a previous save to delete.");
                return;
            }
            if (confirm("Are you sure you want to delete '" + saveName + "'?")) {
                let matchIndex = sortsaves.findIndex(save => save.saveName === saveName);
                if (matchIndex !== -1) {
                    sortsaves.splice(matchIndex, 1);
                }

                $("#save-" + saveName).remove();
                savelist.splice(savelist.indexOf(saveName), 1);

                if (sortsaves.length === 0) {
                    $("#saveopts").append($("<option></option>").val("none").attr("id", "nosave").attr("selected", "selected").attr("disabled", "disabled").text("No saves yet!"));
                    localStorage.removeItem(savefile);
                } else {
                    localStorage.setItem(savefile, JSON.stringify(sortsaves));
                }
            }
        });

        // Export button functionality
        $("#exportbutton").on("click", function () {
            downloadString();
        });

        $('#newnode').on('input', function() {
            const newNodeInput = $(this).val().trim();
            $('#add_node').prop('disabled', newNodeInput === '');
        });

        // Load button functionality
        $('#loadbutton').click(function () {
            if (!window.FileReader) {
                alert('FileReader API is not supported by your browser.');
                return;
            }
            let input = $('#browsebutton')[0];
            if (input.files && input.files[0]) {
                let file = input.files[0];
                let fr = new FileReader();
                fr.onload = function () {
                    try {
                        let testjson = JSON.parse(fr.result);
                        renderTree(testjson);
                    } catch (err) {
                        console.error("JSON parsing failed: ", err);
                        alert("The JSON file you have tried to load is not compatible with the Sorting Tool.");
                    }
                };
                fr.readAsText(file);
            } else {
                alert("File not selected or browser incompatible.");
                return;
            }
            $("#treeoptions, #closeleft").show();
        });

        // Initialize options and generate captcha code
        $("opts[value='0']").attr('selected', 'selected');
        GenerateCode();

        // Change event for options
        $('#opts').on('change', function () {
            $('#saveopts').val("blank");
            let newData = eval(d3.select(this).property('value'));
            renderTree(newData);
            $("#treeoptions, #closeleft").show();
        });

        // Change event for browsing a file
        $('#browsebutton').on('change', function () {
            const loadButton = document.getElementById('loadbutton');
            loadButton.disabled = !this.files.length;
        });

        // Create blank workspace
        $("#blankspace").on("click", function () {
            let rootname = prompt("Name your root node:");
            if (rootname == null) {
                alert("Blank workspace not created.");
            } else if (/^\w+( \w+)*$/.test(rootname)) {
                let treeDataExtend = {
                    "name": "root",
                    "children": [
                        { "name": "branch", "children": { "name": rootname } },
                        { "name": "recycle", "children": { "name": "recycle" } }
                    ]
                };
                renderTree(treeDataExtend);
                $("#treeoptions, #closeleft").show();
            }
        });

        // Load saved data
        $('#saveopts').on('change', function () {
            $('#opts').val("blank");
            let newData = $(this).val();
            let loadNum = savelist.indexOf(newData);

            if (loadNum === -1) {
                return; // Blank was selected. Do Nothing.
            }

            let loadData = sortsaves[loadNum]["rootBranch"];
            let loadRecycle = sortsaves[loadNum]["rootRecycle"];
            let loadOrig = sortsaves[loadNum]["rootOrig"];
            let loadOrphans = sortsaves[loadNum]["rootOrphans"];

            let recycle = loadRecycle ? JSON.parse(loadRecycle) : JSON.parse(loadOrphans);
            let branch = JSON.parse(loadData);
            let orig = JSON.parse(loadOrig);

            let treeDataExtend = {
                "name": "root",
                "children": [recycle, branch, orig]
            };

            renderTree(treeDataExtend);
            $("#treeoptions").show();
        });

        // Add node functionality
        $("#add_node").click(function () {
            AddNode();
            $("#newnode").val("");
            $('#add_node').prop('disabled', true);
        });

        // Toggle feedback section
        $("#hidebutton").on("click", function () {
            $("#feedback, #showbutton, #hidebutton").toggle();
        });

        $("#showbutton").on("click", function () {
            $("#feedback, #showbutton, #hidebutton").toggle();
        });
    });
})(jQuery);

/**
 * Creates a circular reference replacer for JSON.stringify.
 * @returns {Function} - The replacer function.
 */
const getCircularReplacer = () => {
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
    return jsonString.replace(/_children/gm, 'children')
        .replace(/,"children":null/gm, '')
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
            recycle = { "name": "recycle", "children": root["children"][i] };
            recycle1 = JSON.stringify(recycle, getCircularReplacer());
        } else {
            branch = { "name": "branch", "children": root["children"][i] };
            root1 = JSON.stringify(branch, getCircularReplacer());
        }
    }

    let orig1 = { "name": "orig", "children": orig };
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
    let nodeName = $('#newnode').val();
    let errorDiv = $('#error');
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
            recycle = { "name": "recycle", "children": root["children"][i] };
        } else {
            branch = { "name": "branch", "children": root["children"][i] };
        }
    }

    let orig1 = { "name": "orig", "children": orig };
    let section = {
        "name": "root",
        "children": [
            { "name": "branch", "children": branch["children"] },
            { "name": "recycle", "children": recycle["children"] },
            { "name": "orig", "children": orig1["children"] }
        ]
    };

    let exportjson = cleanJSON(JSON.stringify(section, getCircularReplacer()));
    let file = "data:text/plain;charset=utf-8," + encodeURIComponent(exportjson);
    let a = document.createElement('a');
    a.href = file;
    a.target = '_blank';
    a.download = "export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
}

try {
    module.exports = {
        cleanJSON,
        downloadString,
        savestuff,
        getCircularReplacer,
        storenewsave
    };
} catch {
    // Do Nothing. This is only for tests
}