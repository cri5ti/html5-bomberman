
define([
    "jquery", "underscore", "backbone"
], function($, _, Backbone) {


    var MOVE_ANIM_SPEED = 0.15;
    var SQUARE_SIZE = 16;

    var CHAR_W = 22;
    var CHAR_H = 22;
    var CHAR_CX = 11;
    var CHAR_CY = 17;

    GameCanvas = Backbone.View.extend({

        initialize: function(opt) {
            this.world = opt.world;

            this.$canvas = $('<canvas width="600" height="400"/>');
            this.canvas = this.$canvas.get(0);
            this.ctx = this.canvas.getContext("2d");

            $('#map').append(this.$canvas);

            this.sprite = {};
            _.each(['john','joe','betty','mary'], _.bind(function(c) {
                this.sprite[c] = $('<img src="res/char-'+c+'.png"/>').get(0);
            }, this));
        },

        update: function(dt) {

            this.ctx.drawImage(this.world.mapView.canvas,
                this.world.map.get('x') * 16,
                this.world.map.get('y') * 16
            );

            this.world.players.each(_.bind(this.drawCharacter, this));

            this.world.flames.each(_.bind(this.drawFlame, this));
        },


        drawCharacter: function(c) {
            var frame = Math.floor(c.get('frame') / MOVE_ANIM_SPEED);

            var framex;
            if (!c.get('dead')) {
                // alive
                framex = frame % 3;
                if (!c.get('moving')) framex = 1;
                var framey = c.get('orient');
            } else {
                // dead
                framey = Math.floor(frame / 3) + 4;
                framex = frame % 3;
            }

            var x = Math.round( c.get('x') * SQUARE_SIZE ) - CHAR_CX;
            var y = Math.round( c.get('y') * SQUARE_SIZE ) - CHAR_CY;

            var spr = this.sprite[c.get('character')];

            this.ctx.drawImage(spr, framex * CHAR_W, framey*CHAR_H, CHAR_W, CHAR_H,
                                    x, y, CHAR_H, CHAR_H);

        },


        drawFlame: function(f) {

        }

    });

});