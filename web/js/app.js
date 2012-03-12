
TILE_EMPTY = 0;
TILE_BRICK = 1;
TILE_SOLID = 2;

require.config(
    {
        baseUrl: "js",
        paths: {
            "backbone": "lib/backbone",
            "underscore": "lib/underscore",
        },
        locale: "en"
    }
);


require([
    "jquery", "underscore", "backbone",
    "Game",
	"polyfills/jscript"
],function($, _, Backbone, core) {


    /**
     * Initialize
     */
    $(function() {

        $userid = $('#userid');

        $('#loginBtn').click(login);

        updateButton = function() {
            if ($userid.val().length==0)
                $('#loginBtn').attr('disabled', 'disabled');
            else
                $('#loginBtn').removeAttr('disabled');
        }

        $userid.change(updateButton);
        $userid.keyup(updateButton);

        $userid.keydown(function(e) {
            if (e.keyCode == 13) {
                login();
                e.stopImmediatePropagation();
            }
        });

        var defaultUser = localStorage.getItem("user");
        if (defaultUser)
            $userid.val(defaultUser);
        $userid.focus();

        updateButton();
    });

    function login() {
        var userid = $userid.val();
        if (userid.length==0) return;

        localStorage.setItem("user", userid);

        $userid.blur();
        $("#welcome").hide();

        $("#ingame").show();

        start(userid);
    }

    function start(name) {
        var game = new Game({playerName: name});
    }

});

function info(m) {
    chat(m, "info");
}

function kill(p1, p2) {
    chat("<div class='bomb'></div><u>"+p1+"</u> killed by <u>"+p2+"</u>", "kill");
}

function suicide(p1, p2) {
    chat("<div class='bomb'></div><u>"+p1+"</u> suicided", "kill");
}

function chat(m, cls) {
    var d = $("<div>");
    d.html(m);
    d.addClass(cls);
    $('#chat').append(d);
}

function play(snd) {
    var a = new Audio("/snd/" + snd + ".wav");
    a.play();
}