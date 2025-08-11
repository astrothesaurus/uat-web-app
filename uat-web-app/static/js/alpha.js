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
    var exportBtn = document.getElementById("exportJsonBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", exportResults);
    }
});

document.addEventListener("DOMContentLoaded", setFormFromUrl);
window.addEventListener("pageshow", setFormFromUrl);

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


    $(".alpha-tab").click(function (event) {
        handleTabClick("alpha", "hierarchy", "search", ".alpha-tab", "#alpha", event);
    });

    $(".hierarchy-tab").click(function (event) {
        handleTabClick("hierarchy", "search", "alpha", ".hierarchy-tab", "#hierarchy", event);
    });

    $(".search-tab").click(function (event) {
        handleTabClick("search", "hierarchy", "alpha", ".search-tab", "#search", event);
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