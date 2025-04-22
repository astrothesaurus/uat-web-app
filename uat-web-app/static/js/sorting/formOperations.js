/**
 * Sends form data and tree differences via an HTTP POST request.
 */
function TestForm() {
    let root = getRoot();
    let orig = getOrig();
    let diffStr = difftree(orig, root);
    let url = "/email";
    let name = document.getElementById("first_name").value;
    let inst = document.getElementById("yourinst").value;
    let uremail = document.getElementById("youremail").value;
    let urnotes = document.getElementById("notes").value;
    d3.xhr(url)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .post(`testarg=Name: ${name}\nInstituion: ${inst}\nEmail: ${uremail}\nNotes: ${urnotes}\n\nDifference File:\n${diffStr}`);
}

/**
 * Validates the form and sends feedback if valid.
 * @param {HTMLFormElement} theform - The form element.
 * @returns {boolean} - True if the form is valid, false otherwise.
 */
function checkform(theform) {
    let why = "";

    try {

        if (theform.txtInput.value === "") {
            why += "Robot Check code should not be empty.";
        }
        if (theform.txtInput.value !== "") {
            if (ValidCaptcha(theform.txtInput.value)) {
                why += "Thank you for your feedback!";
                TestForm();
            } else {
                why += "Robot Check code did not match.";
            }
        }
    } catch (error) {
        console.error("Error in checkform: ", error);
        why += "You must select a branch to give feedback on";
    }

    if (why !== "") {
        openAlertModal(why);
        return false;
    }
}

try {
    module.exports = {
        checkform,
        TestForm
    };
} catch {
    // Do Nothing. This is only for tests
}