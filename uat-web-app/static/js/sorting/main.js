(function ($) {
    $(document).ready(function () {
        $("#browsebutton").val("");
        $("#opts").val("blank");
        $("#loadbutton").prop("disabled", true);

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
            $("#secondleft, #hidebutton").hide();
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
                showPromptModal("Name for save file?", function (saveName) {
                    if (saveName !== null) {
                        if (/^\w+( \w+)*$/.test(saveName)) {
                            if (savelist.includes(saveName)) {
                                openAlertModal("Please choose a unique name for your save file!");
                            } else {
                                $("#opts").val("blank");
                                savestuff(saveName, sortsaves);
                                savelist.push(saveName);

                                if ($("#nosave").length > 0) {
                                    $("#nosave, #blank").remove();
                                    $("#saveopts").append($("<option></option>").val("blank").attr("id", "blank").text(" ").attr("disabled", "disabled"));
                                }

                                $("#saveopts").append($("<option></option>").val(saveName).text(saveName).attr("selected", "selected").attr("id", "save-" + saveName));
                            }
                        } else {
                            openAlertModal("The save name can only include letters, numbers, spaces, and underscores.");
                        }
                    } else {
                        openAlertModal("Data Not Saved");
                    }
                });
            } catch (error) {
                console.error("Saving failed: ", error);
                openAlertModal("You have nothing to save.");
            }
        });

        // Override button functionality
        $("#overridebutton").on("click", function () {
            let saveName = $("#saveopts").val();
            if (saveName == null || saveName === "blank") {
                openAlertModal("You have nothing to save, try 'Save As...'.");
                return;
            }
            showConfirmModal("Are you sure you want to save over '" + saveName + "'?", function (result) {
                if (result) {
                    let match = sortsaves.findIndex(save => save["saveName"] === saveName);
                    if (match !== -1) {
                        sortsaves.splice(match, 1);
                        savestuff(saveName, sortsaves);
                    }
                }
            });
        });

        // Delete button functionality
        $("#deletebutton").on("click", function () {
            let saveName = $("#saveopts").val();
            if (saveName == null || saveName === "blank") {
                openAlertModal("Please choose a previous save to delete.");
                return;
            }
            showConfirmModal("Are you sure you want to delete '" + saveName + "'?", function (result) {
                if (result) {
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
        });

        // Export button functionality
        $("#exportbutton").on("click", function () {
            downloadString();
        });

        $("#newnode").on("input", function () {
            const newNodeInput = $(this).val().trim();
            $("#add-node").prop("disabled", newNodeInput === "");
        });

        // Load button functionality
        $("#loadbutton").click(function () {
            if (!window.FileReader) {
                openAlertModal("FileReader API is not supported by your browser.");
                return;
            }
            let input = $("#browsebutton")[0];
            if (input.files && input.files[0]) {
                let file = input.files[0];
                let fr = new FileReader();
                fr.onload = function () {
                    try {
                        let testjson = JSON.parse(fr.result);
                        renderTree(testjson);
                    } catch (err) {
                        console.error("JSON parsing failed: ", err);
                        openAlertModal("The JSON file you have tried to load is not compatible with the Sorting Tool.");
                    }
                };
                fr.readAsText(file);
            } else {
                openAlertModal("File not selected or browser incompatible.");
                return;
            }
            $("#treeoptions, #closeleft").show();
        });

        // Initialize options
        $("opts[value='0']").attr("selected", "selected");

        // Change event for options
        $("#opts").on("change", function () {
            $("#saveopts").val("blank");
            let newData = eval(d3.select(this).property("value"));
            renderTree(newData);
            $("#treeoptions, #closeleft").show();
        });

        // Change event for browsing a file
        $("#browsebutton").on("change", function () {
            const loadButton = document.getElementById("loadbutton");
            loadButton.disabled = !this.files.length;
        });

        // Create blank workspace
        $("#blankspace").on("click", function () {
            showPromptModal("Name your root node:", function (rootname) {
                if (rootname !== null) {
                    if (/^\w+( \w+)*$/.test(rootname)) {
                        let treeDataExtend = {
                            "name": "root",
                            "children": [
                                {"name": "branch", "children": {"name": rootname}},
                                {"name": "recycle", "children": {"name": "recycle"}}
                            ]
                        };
                        renderTree(treeDataExtend);
                        $("#treeoptions, #closeleft").show();
                    }
                } else {
                    openAlertModal("Blank workspace not created.");
                }
            });
        });

        // Load saved data
        $("#saveopts").on("change", function () {
            $("#opts").val("blank");
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
        $("#add-node").click(function () {
            AddNode();
            $("#newnode").val("");
            $("#add-node").prop("disabled", true);
        });

        // Toggle feedback section
        $("#hidebutton").on("click", function () {
            $("#secondleft, #showbutton, #hidebutton").toggle();
        });

        $("#showbutton").on("click", function () {
            $("#secondleft, #showbutton, #hidebutton").toggle();
        });
    });
})(jQuery);