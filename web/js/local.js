



define([
    "jquery", "underscore", "backbone",
],function($, _, Backbone, core) {

	// consts
    var LEFT = 37;
    var UP = 38;
    var RIGHT = 39;
    var DOWN = 40;
    var SPACE = 32;

    var PLAYER_MOVE_SPEED = 5; // squares per second


    var keymap = {}; // it's ok to be global

    var inChat = false;

    LocalManager = Backbone.Model.extend({
        defaults: {
        },

        initialize: function(opt) {
            this.$document = opt.document;
            this.world = opt.world;
            this.network = opt.network;

            this.me = this.world.player;

            this.$console = $("#console");
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
            if (!inChat)
                keymap[e.keyCode] = true;

            if (e.keyCode == 13) {
                if (this.$chatbox.is(":focus")) {
                    this.$chatbox.blur();
                    this.$console.animate({
                        'height': 'toggle',
                        'margin-bottom': 'toggle'
                    }, 200);
                    this.network.sendChat(this.$chatbox.val());
                    this.$chatbox.val("");
                    inChat = false;
                } else {
                    this.$console.animate({
                        'height': 'toggle',
                        'margin-bottom': 'toggle'
                    }, 200);
                    this.$chatbox.focus();
                    inChat = true;
                }
            }
        },

        onKeyUp: function(e) {
            keymap[e.keyCode] = false;
        },

        update: function(delta) {
            if (this.me.get('dead')) return;

            var speed = delta * PLAYER_MOVE_SPEED;
            var dx = 0;

            var dy = 0;
            // handle input
            if (keymap[LEFT])   dx-=speed;
            if (keymap[RIGHT])  dx+=speed;
            if (keymap[UP])     dy-=speed;
            if (keymap[DOWN])   dy+=speed;

            var moving = keymap[LEFT] || keymap[RIGHT] || keymap[UP] || keymap[DOWN];

            if (moving)
                this.requestMove(dx, dy);

            if (keymap[SPACE])
                this.tryPlaceBomb();

            this.me.set('moving', moving===true);

            var cx = Math.floor(this.me.get('x'));
            var cy = Math.floor(this.me.get('y'));

            var flame = this.world.map.getFlame(cx, cy);
            if (flame!=null) {
                this.me.die(flame);
                play('die');
            }
        },

        tryPlaceBomb: function() {
            var x = Math.floor(this.me.get('x'));
            var y = Math.floor(this.me.get('y'));
            if (this.world.map.getBomb(x, y) == null)
                this.world.placeBomb(x, y);
        },

        requestMove: function(dx, dy) {
            var x = this.me.get('x');
            var y = this.me.get('y');

            var PLAYER_GIRTH = 0.35;

            var gx = Math.floor(x);
            var gy = Math.floor(y);
            var gtx = Math.floor(x + dx + util.dir(dx)*PLAYER_GIRTH );
            var gty = Math.floor(y + dy + util.dir(dy)*PLAYER_GIRTH );

            // can it move on X axis?
            if (!this.world.map.canMove( gx, gy, gtx, gy ) )
                dx = 0; // no x axis moving
            else {
                gx = Math.floor(x + dx);
            }

            if (!this.world.map.canMove( gx, gy, gx, gty ) )
                dy = 0; // no y axis moving

            this.me.deltaMove(dx, dy);
        }


    });

    util = {};
    util.dir = function(x) { return x>0 ? 1 : x<0 ? -1 : 0 }
    util.ease = function(x, y, c) {
        return x*(1-c) + y*c;
    }


});