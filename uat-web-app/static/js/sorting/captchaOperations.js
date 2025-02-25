/**
 * Generates a new captcha code.
 */
function GenerateCode() {
    let code = Array.from({ length: 5 }, () => Math.ceil(Math.random() * 9)).join("");
    document.getElementById("txtCaptcha").value = code;
    document.getElementById("txtCaptchaDiv").innerHTML = code;
}

/**
 * Clears the captcha input field.
 */
function ClearFields() {
    document.getElementById("txtInput").value = "";
}

/**
 * Removes spaces from a string.
 * @param {string} string - The string to remove spaces from.
 * @returns {string} - The string without spaces.
 */
function removeSpaces(string) {
    return string.split(' ').join("");
}

/**
 * Validates the entered captcha code against the generated code.
 * @returns {boolean} - True if the captcha is valid, false otherwise.
 */
function ValidCaptcha() {
    let str1 = removeSpaces(document.getElementById('txtCaptcha').value);
    let str2 = removeSpaces(document.getElementById('txtInput').value);
    if (str1 === str2) {
        ClearFields();
        GenerateCode();
        return true;
    } else {
        return false;
    }
}

try {
    module.exports = {
        ValidCaptcha,
        GenerateCode,
        removeSpaces
    };
} catch {
    // Do Nothing. This is only for tests
}