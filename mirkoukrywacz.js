// ==UserScript==
// @name         Mirkoukrywacz
// @namespace    wykophidepost
// @version      1.0.0
// @description  Skrypt dodający na Mikroblogu Wykop.pl przycisk pozwalający na ukrywanie wpisów.
// @author       zranoI
// @include      /^https?:\/\/.*wykop\.pl\/mikroblog.*/
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==


function getCookie(name) {
    if (document.cookie.length <= 0) {
        return "";
    }

    var start = document.cookie.indexOf(name + "=");
    if (start === -1) {
        return "";
    }

    start += name.length + 1;
    var end = document.cookie.indexOf(";", start);
    if (end === -1) {
        end = document.cookie.length;
    }
    return unescape(document.cookie.substring(start, end));
}

function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }

    document.cookie = name + "=" + value + expires + "; path=/";
}

function isListEmpty(list) {
    var listIsEmpty = true;
    $.each(list, function (index, value) {
        if (value !== "") {
            listIsEmpty = false;
            return;
        }
    });
    return listIsEmpty;
}

function createUnhideListItemCode(postId) {
    var htmlCode = '<li id="unhide-list-item-' + postId + '"><b>';

    htmlCode += '<a style="width: 65%; display: inline-block; border-bottom: none !important;" href="http://www.wykop.pl/wpis/' + postId + '">' + postId + '</a>';
    htmlCode += '<a style="text-align: right; width: 35%; display: inline-block; border-bottom: none !important; cursor: pointer;" id="unhide-post-' + postId + '">usuń</a>';

    htmlCode += '</b></li>';
    return htmlCode;
}

function createUnhideMenu(unhideAllId) {
    var htmlCode = '<div id="unhide-menu-dropdown" class="dropdown m-hide" style="margin-left: -40px; width: 200px; display: none;"><div><ul>';

    htmlCode += '<li><a style="text-align: center; cursor: pointer;" id="' + unhideAllId + '">Wyczyść ukryte</a></li>';
    htmlCode += '<li><a style="text-align: center; cursor: pointer;" href="http://www.wykop.pl/dodatki/pokaz/867">O skrypcie</a></li>';
    htmlCode += '</ul>';

    htmlCode += '<ul id="unhide-menu-list" style="max-height: 200px;">';

    var hiddenIds = getCookie("hidden_ids").split(",");
    if (isListEmpty(hiddenIds)) {
        hiddenIds = [];
    }

    $.each(hiddenIds, function (key, value) {
        htmlCode += createUnhideListItemCode(value);
    });

    htmlCode += '</ul></div></div>';

    var unhideMenu = $(htmlCode);

    unhideMenu.hover(function () {
        clearTimeout(window.hovertimeout);
    }, function () {
        window.hovertimeout = setTimeout(function () {
            unhideMenu.hide();
        }, 500);
    });

    return unhideMenu;
}

function removeUnhideButtonsForId(postId) {
    if ($("#unhide-menu-list li:last-child").attr('id') === "unhide-list-item-" + postId) {
        window.hovertimeout = setTimeout(function () {
            $("#unhide-menu-dropdown").hide();
        }, 500);
    }

    $("#unhide-list-item-" + postId).remove();
    $("#undo-button-" + postId).remove();
}

function unhidePostWithId(id) {
    var post = $("div.dC[data-id=" + id + "]").parent();
    post.css("display", "");
}

function unhideAll() {
    var hiddenIds = getCookie("hidden_ids").split(",");
    if (isListEmpty(hiddenIds)) {
        hiddenIds = [];
    }

    $.each(hiddenIds, function (key, value) {
        unhidePostWithId(value);
        removeUnhideButtonsForId(value);
    });

    createCookie("hidden_ids", "", 1);
}

function unhidePost(postId) {
    unhidePostWithId(postId);

    var hiddenIds = getCookie("hidden_ids").split(",");

    if (isListEmpty(hiddenIds)) {
        hiddenIds = [];
    }

    hiddenIds.splice(hiddenIds.indexOf(postId), 1);
    createCookie("hidden_ids", hiddenIds.join(","), 1);
}

function addUnhideMenuButtonClickHandler(button) {
    button.click(function () {
        var postId = /unhide\-post\-(\d+)/.exec($(this).attr('id'))[1];
        unhidePost(postId);
        removeUnhideButtonsForId(postId);
    });
}

function addMainScriptButton() {
    var listItem = $('<li>');
    var button = $('<a style="cursor: pointer;">Mirkoukrywacz</a>');

    var unhideAllId = "unhide-all-button";
    var unhideMenu = createUnhideMenu(unhideAllId);

    button.click(function () {
        unhideMenu.show();
    });

    button.hover(function () {
        clearTimeout(window.hovertimeout);
    }, function () {
        window.hovertimeout = setTimeout(function () {
            unhideMenu.hide();
        }, 500);
    });

    listItem.append(button);
    listItem.append(unhideMenu);

    $("ul.mainnav").children().last().after(listItem);

    $("#unhide-all-button").click(unhideAll);
    $("a[id^=unhide-post]").each(function () {
        addUnhideMenuButtonClickHandler($(this));
    });
}

function addUndoButtonClickHandler(button, postId, post) {
    button.remove();
    $("#unhide-list-item-" + postId).remove();

    var hiddenIds = getCookie("hidden_ids").split(",");

    if (isListEmpty(hiddenIds)) {
        hiddenIds = [];
    }

    hiddenIds.splice(hiddenIds.indexOf(postId), 1);
    post.css("display", "");
    createCookie("hidden_ids", hiddenIds.join(","), 1);
}

function addHideButtons() {
    $(".entry.iC > div.dC").each(function () {
        var postId = $(this).attr("data-id");
        var button = $('<button class="button mikro" style="margin-left: 5px;">Ukryj wpis</button>');

        button.click(function () {
            triggerLazyLoad();
            
            var post = $("div.dC[data-id=" + postId + "]").parent();
            var undoButton = $('<li id="undo-button-' + postId + '" style="width: 100%;" class="button">Cofnij ukrycie</li>');

            undoButton.click(function() { addUndoButtonClickHandler($(this), postId, post); });

            post.after(undoButton);
            post.css("display", "none");

            $("#unhide-menu-list").append($(createUnhideListItemCode(postId)));
            addUnhideMenuButtonClickHandler($("#unhide-post-" + postId));

            var hiddenIds = getCookie("hidden_ids").split(",");

            if (isListEmpty(hiddenIds)) {
                hiddenIds = [];
            }

            if (hiddenIds.indexOf(postId) === -1) {
                hiddenIds.push(postId);
            }

            createCookie("hidden_ids", hiddenIds.join(","), 1);
        });

        $(this).find("div > .author.ellipsis").children().eq(2).after(button);
    });
}

function triggerLazyLoad() {
    $("img").each(function() {
        $(this).attr("src", $(this).attr("data-original"));
    });
}

$(document).ready(function () {
    var hiddenIds = getCookie("hidden_ids").split(",");

    if (hiddenIds.indexOf("") === -1) {
        $.each(hiddenIds, function (index, value) {
            $("div.dC[data-id=" + value + "]").parent().css("display", "none");
        });
        triggerLazyLoad();
    }

    addMainScriptButton();
    addHideButtons();
});