



define([
    "jquery", "underscore", "backbone",
],function($, _, Backbone, core) {


    var LEFT = 37;
    var UP = 38;
    var RIGHT = 39;
    var DOWN = 40;

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
            var speed = delta * 5;

            // handle input
            if (keymap[LEFT])   this.me.deltaMove(-speed, 0);
            if (keymap[RIGHT])  this.me.deltaMove(speed, 0);
            if (keymap[UP])     this.me.deltaMove(0, -speed);
            if (keymap[DOWN])   this.me.deltaMove(0, speed);

            this.me.set('moving', keymap[LEFT] || keymap[RIGHT] || keymap[UP] || keymap[DOWN] );
        }

    });


});