function handleTabClick(tabName, inactive1, inactive2, tabSelector, contentSelector, event) {
    localStorage.setItem("currentTab", tabName);
    localStorage.setItem("inactive1", inactive1);
    localStorage.setItem("inactive2", inactive2);

    if ($(tabSelector).hasClass("active")) {
        $(contentSelector).removeClass("active");
        event.preventDefault();
        event.stopPropagation();
        $(tabSelector).removeClass("active").attr("aria-selected", "false");
    }
}

const STICKY_TAB_HEIGHT = 48; // Height of the sticky tab in pixels

function scrollToLetter(letter) {
    document.getElementById(letter).scrollIntoView(true);
    document.getElementById('uatSideBar').scrollTop -= STICKY_TAB_HEIGHT;
    $("#letter" + letter).focus();
}

function getlink(id) {
    const elementId = "-" + id;

    // Find the element with the id ending with the given id
    const element = document.querySelector(`[id$="${elementId}"]`);

    if (element) {
        return element.getAttribute("href");
    }
    return "#"; // Return a default value if the element is not found (shouldn't happen)
}

function checkInput() {
    const input = document.getElementById("uatlookup").value;
    const button = document.getElementById("searchButton");
    button.disabled = input.trim() === "";
}

function clearSearchForm() {
    document.getElementById("uatlookup").value = "";
    document.getElementById("sortOrder").value = "relevance";
    document.getElementById("searchButton").disabled = true;
}

function formatExportedData(obj) {
    if (typeof obj === "string") {
        return obj.replace(/<\/?mark>/g, "");
    } else if (Array.isArray(obj)) {
        return obj.map(formatExportedData);
    } else if (obj && typeof obj === "object") {
        const newObj = {};
        const keys = Object.keys(obj).sort().reverse();
        keys.forEach(key => {
            let newKey = key;
            if (key === "name") {
                newKey = "prefLabel";
            } else if (key === "altNames") {
                newKey = "altLabels";
            } else if (key === "uri") {
                newObj[newKey] = "https://astrothesaurus.org/uat/" + formatExportedData(obj[key]);
                return;
            }
            newObj[newKey] = formatExportedData(obj[key]);
        });
        return newObj;
    }
    return obj;
}

function exportResults() {
    const cleanedResults = formatExportedData(resultsData);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cleanedResults, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "uat_results.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    document.body.removeChild(dlAnchor);
}

function setFormFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const sort = params.get("sort");
    if (sort !== null) {
        document.getElementById("sortOrder").value = sort;
    } else {
        document.getElementById("sortOrder").value = "relevance";
    }
    const lookup = params.get("lookup");
    if (lookup !== null) {
        document.getElementById("uatlookup").value = lookup;
    } else {
        document.getElementById("uatlookup").value = "";
    }
    checkInput();
}

try {
    module.exports = {
        handleTabClick,
        scrollToLetter,
        getlink,
        checkInput,
        clearSearchForm,
        formatExportedData,
        exportResults,
        setFormFromUrl
    };
} catch {
    // Do Nothing. This is only for tests
}