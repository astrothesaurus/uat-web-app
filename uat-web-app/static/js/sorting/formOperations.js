const email = "uat-curation@googlegroups.com";
const subject = "Suggestions from Sorting Tool";

function buildBody(name, inst, urnotes, diffStr) {
    return `Name: ${name}\nInstitution: ${inst}\nNotes: ${urnotes}\n\nDifference File:\n${diffStr}`;
}

function getFormValues() {
    const name = document.getElementById("first_name")?.value || "";
    const inst = document.getElementById("yourinst")?.value || "";
    const urnotes = document.getElementById("notes")?.value || "";
    return { name, inst, urnotes };
}

function openEmail() {
    const { name, inst, urnotes } = getFormValues();
    const diffStr = decodeURIComponent(difftree(getOrig(), getRoot()));
    const body = encodeURIComponent(buildBody(name, inst, urnotes, diffStr));
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

function openOutlook() {
    const { name, inst, urnotes } = getFormValues();
    const diffStr = decodeURIComponent(difftree(getOrig(), getRoot()));
    const body = encodeURIComponent(buildBody(name, inst, urnotes, diffStr));
    const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${email}&subject=${encodeURIComponent(subject)}&body=${body}`;
    window.open(outlookUrl, '_blank');
}

function openGmail() {
    const { name, inst, urnotes } = getFormValues();
    const diffStr = decodeURIComponent(difftree(getOrig(), getRoot()));
    const body = encodeURIComponent(buildBody(name, inst, urnotes, diffStr));
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${body}`;
    window.open(gmailUrl, '_blank');
}

function downloadEML() {
    const { name, inst, urnotes } = getFormValues();
    const diffStr = decodeURIComponent(difftree(getOrig(), getRoot()));
    const body = buildBody(name, inst, urnotes, diffStr);
    const emlContent = [
        `To: ${email}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset=UTF-8',
        '',
        body
    ].join('\r\n');

    const blob = new Blob([emlContent], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback.eml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

try {
    module.exports = {
        buildBody,
        openEmail,
        openOutlook,
        openGmail,
        downloadEML
    };
} catch {
    // Do Nothing. This is only for tests
}