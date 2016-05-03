// ==UserScript==
// @name         Mikroblog: Ukryj wpis
// @namespace    wykophidepost
// @version      1.0.0
// @description  Skrypt dodający na Mikroblogu Wykop.pl przycisk pozwalający na ukrywanie wpisów.
// @author       zranoI
// @include      /^https?:\/\/.*wykop\.pl\/mikroblog.*/
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==


// TODO: sprawdzić kod (optymalizacja)
// TODO: modal pozwalający na usuwanie pojedynczych wpisów z listy ukrytych

function getCookie(name) {
    if (document.cookie.length <= 0) {
        return "";
    }

    start = document.cookie.indexOf(name + "=");
    if (start == -1) {
        return "";
    }

    start += name.length + 1;
    end = document.cookie.indexOf(";", start);
    if (end == -1) {
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
    }
    else {
        expires = "";
    }

    document.cookie = name + "=" + value + expires + "; path=/";
}

function isListEmpty(list) {
    var emptyList = true;
    $.each(list, function(index, value) {
        if (value !== "") {
            emptyList = false;
            return;
        }
    });
    return emptyList;
}

function addHideButtons() {
    $(".entry.iC > div.dC").each(function() {
        var postId = $(this).attr("data-id");
        var button = $('<button class="button mikro" style="margin-left: 5px;">Ukryj wpis</button>');

        button.click(function() {
            var post = $("div.dC[data-id=" + postId + "]").parent();
            var undoButton = $('<li style="width: 100%; margin-left: 5px;" class="button">Cofnij ukrycie</li>');
            
            undoButton.click(function() {
                this.remove();
                
                var hiddenIds = getCookie("hidden_ids").split(",");

                if (isListEmpty(hiddenIds)) {
                    hiddenIds = [];
                }
                
                hiddenIds.splice(hiddenIds.indexOf(postId), 1);
                post.css("display", "");
                createCookie("hidden_ids", hiddenIds.join(","), 1);
            });

            post.after(undoButton);
            post.css("display", "none");
            
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

function addUnhideButton() {
    var button = $('<li><a style="cursor: pointer;">Wyczyść ukryte</a></li>');

    button.click(function() {
        var hiddenIds = getCookie("hidden_ids").split(",");

        if (!isListEmpty(hiddenIds)) {
            $.each(hiddenIds, function(index, value) {
                $("div.dC[data-id=" + value + "]").parent().css("display", "");
            });
        }

        createCookie("hidden_ids", "", 1);
    });

    $("ul.mainnav").children().last().after(button);
}

$(document).ready(function() {
    var hiddenIds = getCookie("hidden_ids").split(",");

    if (hiddenIds.indexOf("") === -1) {
        $.each(hiddenIds, function(index, value) {
            $("div.dC[data-id=" + value + "]").parent().css("display", "none");
        });
    }

    addUnhideButton();
    addHideButtons();
});