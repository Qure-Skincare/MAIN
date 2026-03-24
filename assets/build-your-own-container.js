var links = document.querySelectorAll("ul.qure_tabs li a");
links.forEach(function (link) {
    var id = link.getAttribute("href").replace("#build-your-own-target-", "");
    var target = document.getElementById("build-your-own-target-" + id);
    var source = document.getElementById(id);
    if (source && target) {
        target.appendChild(source.content.cloneNode(true));
    }
});