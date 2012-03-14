

define([
    "jquery", "underscore", "backbone",

    "local",
    "Networking",
    "World"
], function($, _, Backbone) {

    Game = Backbone.View.extend({

        initialize: function(opt) {
            this.world = new World({
                container: $("#game"),
                myName: opt.playerName // TODO refactor this
            });

            this.networking = new Networking({
                world: this.world
            });

            this.local = new LocalManager({
                document: $(document),
                world: this.world,
                network: this.networking
            });

            this.lastTime = getTicks();
            _.defer(_.bind(this.update, this));
        },


        update: function() {
            var now = getTicks();
            var delta = (now - this.lastTime) / 1000;

            this.local.update(delta);
            this.world.update(delta);

            this.lastTime = now;

            window.requestAnimationFrame(_.bind(this.update, this));
        }

    });


    function getTicks() {
        return new Date().getTime();
    }

});
