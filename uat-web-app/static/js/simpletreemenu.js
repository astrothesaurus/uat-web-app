let persisteduls = {};
let ddtreemenu = {};

ddtreemenu.closefolder = {src: "/img/closed.gif", alt: "Expand folder"}; // Set image path to "closed" folder image
ddtreemenu.openfolder = {src: "/img/open.gif", alt: "Collapse folder"}; // Set image path to "open" folder image

////////// No need to edit beyond here ///////////////////////////

// Function to set background image with label
ddtreemenu.setBackgroundImage = function (element, folder) {
    element.style.backgroundImage = "url(" + folder.src + ")";
    element.setAttribute("aria-label", folder.alt);
};

/**
 * Expands a UL element and any of its parent ULs.
 * @param {string} treeid - The ID of the tree element.
 * @param {HTMLElement} ulelement - The UL element to expand.
 */
ddtreemenu.expandSubTree = function (treeid, ulelement) {
    let rootnode = document.getElementById(treeid);
    let currentnode = ulelement;
    currentnode.style.display = "block";
    ddtreemenu.setBackgroundImage(currentnode.parentNode, ddtreemenu.openfolder);
    while (currentnode !== rootnode) {
        if (currentnode.tagName === "UL") {
            currentnode.style.display = "block";
            currentnode.setAttribute("rel", "open");
            ddtreemenu.setBackgroundImage(currentnode.parentNode, ddtreemenu.openfolder);
        }
        currentnode = currentnode.parentNode;
    }
};

/**
 * Prevents an action from bubbling upwards.
 * @param {Event} e - The event to prevent propagation.
 */
ddtreemenu.preventpropagate = function (e) {
    if (typeof e !== "undefined") {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
};

/**
 * Searches an array for the entered value. If found, deletes the value from the array.
 * @param {Array} thearray - The array to search.
 * @param {any} value - The value to search for.
 * @returns {boolean} - True if the value is found, false otherwise.
 */
ddtreemenu.searcharray = function (thearray, value) {
    let isfound = false;
    for (let i = 0; i < thearray.length; i++) {
        if (thearray[i] === value) {
            isfound = true;
            thearray.shift();
            break;
        }
    }
    return isfound;
};

/**
 * Builds a subtree for the tree menu.
 * @param {string} treeid - The ID of the tree element.
 * @param {HTMLElement} ulelement - The UL element to build the subtree for.
 * @param {number} index - The index of the UL element.
 */
ddtreemenu.buildSubTree = function (treeid, ulelement, index) {
    ulelement.parentNode.className = "submenu";
    if (typeof persisteduls[treeid] === "object") {
        if (ddtreemenu.searcharray(persisteduls[treeid], index)) {
            ulelement.setAttribute("rel", "open");
            ulelement.style.display = "block";
            ddtreemenu.setBackgroundImage(ulelement.parentNode, ddtreemenu.openfolder);
        } else {
            ulelement.setAttribute("rel", "closed");
        }
    } else if (ulelement.getAttribute("rel") == null || ulelement.getAttribute("rel") === false) {
        ulelement.setAttribute("rel", "closed");
    } else if (ulelement.getAttribute("rel") === "open") {
        ddtreemenu.expandSubTree(treeid, ulelement);
    }
    ulelement.parentNode.onclick = function (e) {
        let submenu = this.getElementsByTagName("ul")[0];
        if (submenu.getAttribute("rel") === "closed") {
            submenu.style.display = "block";
            submenu.setAttribute("rel", "open");
            ddtreemenu.setBackgroundImage(ulelement.parentNode, ddtreemenu.openfolder);
        } else if (submenu.getAttribute("rel") === "open") {
            submenu.style.display = "none";
            submenu.setAttribute("rel", "closed");
            ddtreemenu.setBackgroundImage(ulelement.parentNode, ddtreemenu.closefolder);
        }
        ddtreemenu.preventpropagate(e);
    };
    ulelement.onclick = function (e) {
        ddtreemenu.preventpropagate(e);
    };
};

/**
 * Assigns a function to execute to an event handler.
 * @param {Window} target - The target window.
 * @param {Function} functionref - The function to execute.
 * @param {string} tasktype - The type of event (e.g., "unload").
 */
ddtreemenu.dotask = function (target, functionref, tasktype) {
    let eventType = (window.addEventListener) ? tasktype : "on" + tasktype;
    if (target.addEventListener) {
        target.addEventListener(eventType, functionref, false);
    } else if (target.attachEvent) {
        target.attachEvent(eventType, functionref);
    }
};

/**
 * Gets the value of a cookie.
 * @param {string} Name - The name of the cookie.
 * @returns {string} - The value of the cookie.
 */
ddtreemenu.getCookie = function (Name) {
    let re = new RegExp(Name + "=[^;]+", "i");
    if (document.cookie.match(re)) {
        return document.cookie.match(re)[0].split("=")[1];
    }
    return "";
};


/**
 * Sets the value of a cookie.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 * @param {number} days - Number of days to persist the cookie.
 */
ddtreemenu.setCookie = function (name, value, days) {
    let expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + parseInt(days));
    document.cookie = name + "=" + value + "; expires=" + expireDate.toGMTString() + "; path=/";
};

/**
 * Stores the index of opened ULs relative to other ULs in the tree into a cookie.
 * @param {string} treeid - The ID of the tree element.
 * @param {number} durationdays - Number of days to persist the state.
 */
ddtreemenu.rememberstate = function (treeid, durationdays) {
    let ultags = document.getElementById(treeid).getElementsByTagName("ul");
    let openuls = [];
    for (let i = 0; i < ultags.length; i++) {
        if (ultags[i].getAttribute("rel") === "open") {
            openuls[openuls.length] = i;
        }
    }
    if (openuls.length === 0) {
        openuls[0] = "none open";
    }
    ddtreemenu.setCookie(treeid, openuls.join(","), durationdays);
};

/**
 * Creates a tree menu with optional persistence.
 * @param {string} treeid - The ID of the tree element.
 * @param {boolean} enablepersist - Whether to enable persistence.
 * @param {number} persistdays - Number of days to persist the state.
 */
ddtreemenu.createTree = function (treeid, enablepersist, persistdays) {
    let ultags = document.getElementById(treeid).getElementsByTagName("ul");
    if (typeof persisteduls[treeid] === "undefined") {
        persisteduls[treeid] = (enablepersist === true && ddtreemenu.getCookie(treeid) !== "") ? ddtreemenu.getCookie(treeid).split(",") : "";
    }
    for (let i = 0; i < ultags.length; i++) {
        ddtreemenu.buildSubTree(treeid, ultags[i], i);
    }
    if (enablepersist === true) {
        let durationdays = (typeof persistdays === "undefined") ? 1 : parseInt(persistdays);
        ddtreemenu.dotask(window, function () {
            ddtreemenu.rememberstate(treeid, durationdays);
        }, "unload"); // Save opened UL indexes on body unload
    }
};

/**
 * Expands or contracts all UL elements.
 * @param {string} treeid - The ID of the tree element.
 * @param {string} action - The action to perform ("expand" or "contract").
 */
ddtreemenu.flatten = function (treeid, action) {
    let ultags = document.getElementById(treeid).getElementsByTagName("ul");
    for (let i = 0; i < ultags.length; i++) {
        ultags[i].style.display = (action === "expand") ? "block" : "none";
        let relvalue = (action === "expand") ? "open" : "closed";
        ultags[i].setAttribute("rel", relvalue);
        if (action === "expand") {
            ddtreemenu.setBackgroundImage(ultags[i].parentNode, ddtreemenu.openfolder);
        } else {
            ddtreemenu.setBackgroundImage(ultags[i].parentNode, ddtreemenu.closefolder);
        }
    }
};

try {
    module.exports = {
        ddtreemenu
    };
} catch {
    // Do Nothing. This is only for tests
}