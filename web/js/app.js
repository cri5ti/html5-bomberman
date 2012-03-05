
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
    "network", "local",
    "World",
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

        start(userid);
    }

    function start(name) {
        var world = new World({
            container: $("#map"),
            player: true,
            npcs: 0,
            myName: name
        });

        var networking = new Networking({
            world: world
        });

        var local = new LocalManager({
            document: $(document),
            world: world,
            network: networking
        });


        // main loop
        var lastTime = getTicks();
        setInterval(function() {
            var now = getTicks();
            var delta = (now - lastTime) / 1000;

            local.update(delta);
            world.update(delta);

            lastTime = now;
        }, 50);

    }


    function getTicks() {
        return new Date().getTime();
    }



});

function info(m) {
    chat(m, "info");
}

function chat(m, cls) {
    var d = $("<div>");
    d.html(m);
    d.addClass(cls);
    $('#chat').append(d);
}
