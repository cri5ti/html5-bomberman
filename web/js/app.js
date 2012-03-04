
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
    "World"
],function($, _, Backbone, core) {


    /**
     * Initialize
     */
    $(function() {

        var world = new World({
            container: $("#map"),
            player: true,
            npcs: 0
        });

        var networking = new Networking({
            world: world
        });

        var local = new LocalManager({
            document: $(document),
            world: world
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

    });


    function getTicks() {
        return new Date().getTime();
    }




});
