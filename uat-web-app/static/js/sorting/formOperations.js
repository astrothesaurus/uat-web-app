/**
 * Sends form data and tree differences via an HTTP POST request.
 */
function TestForm() {
    let root = getRoot();
    let orig = getOrig();
    let diffStr = decodeURIComponent(difftree(orig, root));
    let name = document.getElementById("first_name").value;
    let inst = document.getElementById("yourinst").value;
    let urnotes = document.getElementById("notes").value;
    let subject = encodeURIComponent("Suggestions from Sorting Tool");
    let body = encodeURIComponent(
        `Name: ${name}\nInstitution: ${inst}\nNotes: ${urnotes}\n\nDifference File:\n${diffStr}`
    );
    const email = "uat-curation@googlegroups.com";
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
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
            if (ValidCaptcha()) {
                why += "Thank you for your feedback!<br>Your email client should have opened.<br>Please review and send the email to complete your submission.";
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