



define([
    "jquery", "underscore", "backbone",
],function($, _, Backbone, core) {


    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const SPACE = 32;

    const PLAYER_MOVE_SPEED = 10; // squares per second

    var keymap = {}; // it's ok to be global

    LocalManager = Backbone.Model.extend({
        defaults: {
        },

        initialize: function(opt) {
            this.$document = opt.document;
            this.world = opt.world;

            this.me = this.world.player;

            this.$chatbox = $("#chatbox");
            this.$chatbox.keyup(_.throttle(_.bind(function() {
                if (this.$chatbox.val().length>0)
                this.world.player.sendMessage(this.$chatbox.val()+"...");
            }, this),50));

            // keyboard handlers
            this.$document.keydown($.proxy(this.onKeyDown, this));
            this.$document.keyup($.proxy(this.onKeyUp, this));
        },

        onKeyDown: function(e) {
            keymap[e.keyCode] = true;

            if (e.keyCode == 13) {
                if (this.$chatbox.is(":focus")) {
                    this.me.sendMessage(this.$chatbox.val());
                    this.$chatbox.val("");
                } else
                    this.$chatbox.focus();
            }
        },

        onKeyUp: function(e) {
            keymap[e.keyCode] = false;
        },

        update: function(delta) {
            var speed = delta * PLAYER_MOVE_SPEED;

            var dx = 0;
            var dy = 0;

            // handle input
            if (keymap[LEFT])   dx-=speed;
            if (keymap[RIGHT])  dx+=speed;
            if (keymap[UP])     dy-=speed;
            if (keymap[DOWN])   dy+=speed;

            var moving = keymap[LEFT] || keymap[RIGHT] || keymap[UP] || keymap[DOWN];

            if (moving) {
                this.requestMove(dx, dy);
            }

            if (keymap[SPACE])
                this.tryPlaceBomb();

            this.me.set('moving', moving);
        },

        tryPlaceBomb: function() {
            this.world.placeBomb(
                Math.floor(this.me.get('x')),
                Math.floor(this.me.get('y'))
            );
        },

        requestMove: function(dx, dy) {
            var ox = this.me.get('x');
            var oy = this.me.get('y');
            var nx = ox + dx;
            var ny = oy + dy;

            var cx = Math.floor(nx);
            var cy = Math.floor(ny);

            if (this.world.map.getAbsTile(cx, cy) == 0)
                this.me.deltaMove(dx, dy);
//            else
        }

    });


});