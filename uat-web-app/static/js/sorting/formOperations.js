/**
 * Sends form data and tree differences via an HTTP POST request.
 */
const email = "uat-curation@googlegroups.com";
const subject = encodeURIComponent("Suggestions from Sorting Tool");

function TestForm() {
    let root = getRoot();
    let orig = getOrig();
    let diffStr = decodeURIComponent(difftree(orig, root));
    let name = document.getElementById("first_name").value;
    let inst = document.getElementById("yourinst").value;
    let urnotes = document.getElementById("notes").value;
    let body = encodeURIComponent(
        `Name: ${name}\nInstitution: ${inst}\nNotes: ${urnotes}\n\nDifference File:\n${diffStr}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    return body;
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
                let body = TestForm();
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
                const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${email}&subject=${subject}&body=${body}`;
                why += `Thank you for your feedback!<br>Your email client should have opened.<br>Please review and send the email to complete your submission.<br>
                Other Email options:<br>
                <button type="button" class="btn btn-danger" onclick="window.open('${gmailUrl}', '_blank')">Gmail</button>
                <button type="button" class="btn btn-primary" style="background-color:#0072C6; border-color:#0072C6;" onclick="window.open('${outlookUrl}', '_blank')">Outlook 365</button>`;
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