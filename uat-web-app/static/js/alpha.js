document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll("a[data-uri]");
    links.forEach(link => {
        const uri = link.getAttribute("data-uri");
        const href = getlink(uri);
        if (href) {
            link.setAttribute("href", href);
        }
    });
    let closedFolders = document.querySelectorAll('.treeview li.submenu');
    closedFolders.forEach(function (folder) {
        folder.style.backgroundImage = "url('/img/closed.gif')";
        folder.setAttribute("aria-label", "Expand folder");
    });
});

function handleTabClick(tabName, inactive1, inactive2, tabSelector, contentSelector) {
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

document.addEventListener("DOMContentLoaded", setFormFromUrl);
window.addEventListener("pageshow", setFormFromUrl);

const STICKY_TAB_HEIGHT = 48; // Height of the sticky tab in pixels
$(document).ready(function () {

    let currentTab = localStorage.getItem("currentTab");
    let currentElement = localStorage.getItem("currentElement");

    if (currentElement != "noelement") {
        let windowSize = $(window).width();
        if (windowSize < 768) {
            $("#hierarchy").removeClass("active");
            $("#search").removeClass("active");
            $("#alpha").removeClass("active");
            $("." + currentTab + "-tab").removeClass("active").attr("aria-selected", "false");
        }
    }

    $(".letter").on("click", function (event) {
        event.preventDefault();
        const letter = $(event.currentTarget).find("span").text().trim();
        scrollToLetter(letter);
    });

    $(".letter").on("keydown", function (event) {
        if (event.key === "Enter" || event.key === " " || event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            const letter = $(event.currentTarget).find("span").text().trim();
            scrollToLetter(letter);
        }
    });

    $(".totopimg").on("keyup", function () {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("alpha-tab").scrollIntoView(true);
            document.getElementById('uatSideBar').scrollTop = 0;
        }
    }).on("click", function () {
        event.preventDefault();
        document.getElementById("alpha-tab").scrollIntoView(true);
        document.getElementById('uatSideBar').scrollTop = 0;
    });

    $(".totopimgm").on("click", function (event) {
        event.preventDefault();
        document.getElementById("topm").scrollIntoView(true);
        document.getElementById('uatSideBar').scrollTop = 0;
    }).on("keydown", function (event) {
        if (event.key === "Enter" || event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("topm").scrollIntoView(true);
            document.getElementById('uatSideBar').scrollTop = 0;
        }
    });


    $(".alpha-tab").click(function () {
        handleTabClick("alpha", "hierarchy", "search", ".alpha-tab", "#alpha");
    });

    $(".hierarchy-tab").click(function () {
        handleTabClick("hierarchy", "search", "alpha", ".hierarchy-tab", "#hierarchy");
    });

    $(".search-tab").click(function () {
        handleTabClick("search", "hierarchy", "alpha", ".search-tab", "#search");
    });

    $(window).on("resize", function (e) {
        let windowSize = $(window).width(); // Could've done $(this).width()

        if (windowSize > 768) {
            let currentTab = localStorage.getItem("currentTab");
            let inactive1 = localStorage.getItem("inactive1");
            let inactive2 = localStorage.getItem("inactive2");

            $("#" + currentTab).addClass("active");
            e.preventDefault();
            e.stopPropagation();
            $("." + inactive1 + "-tab2").removeClass("active");
            $("." + inactive2 + "-tab2").removeClass("active");
            $("." + currentTab + "-tab2").addClass("active").attr("aria-selected", "true");
            $("." + inactive1 + "-tab").removeClass("active");
            $("." + inactive2 + "-tab").removeClass("active");
            $("." + currentTab + "-tab").addClass("active").attr("aria-selected", "true");
            $("." + currentTab).addClass("active").attr("aria-selected", "true");
        }
    });

});


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