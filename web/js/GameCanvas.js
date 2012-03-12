
define([
    "jquery", "underscore", "backbone"
], function($, _, Backbone) {


    var MOVE_ANIM_SPEED = 0.1;
    var FLAME_ANIM_SPEED = 0.15;
    var BOMB_ANIM_SPEED = 0.1;

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

            this.sprCharacters = {};

            _.each(['john','joe','betty','mary'], _.bind(function(c) {
                this.sprCharacters[c] = this._loadSprite("res/char-"+c+".png");
            }, this));

            this.sprFlames = this._loadSprite('res/flames.png');

            this.sprBomb = this._loadSprite('res/bombs.png');
        },

        _loadSprite: function(res) {
            return $('<img src="'+res+'"/>').get(0);
        },

        update: function(dt) {

            this.ctx.drawImage(this.world.mapView.canvas,
                this.world.map.get('x') * 16,
                this.world.map.get('y') * 16
            );

            this.world.flames.each(_.bind(this.drawFlame, this));

            this.world.bombs.each(_.bind(this.drawBomb, this));

            this.world.players.sort().each(_.bind(this.drawCharacter, this));
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

            var spr = this.sprCharacters[c.get('character')];

            this.ctx.drawImage(spr, framex * CHAR_W, framey*CHAR_H, CHAR_W, CHAR_H,
                x, y, CHAR_H, CHAR_H);

        },


        drawFlame: function(f) {
            var frame = Math.floor(f.get('frame') / FLAME_ANIM_SPEED);

            if (frame > 7) {
                // end of flame
                f.trigger('done', f);
                return;
            }

            // reverse frames
            if (frame > 4) frame = 8 - frame;

            // frames go like this:
            // 0 1 2 3 4 5 6 7
            // 0 1 2 3 4 3 2 1

            var x = f.get('x') * SQUARE_SIZE;
            var y = f.get('y') * SQUARE_SIZE;

            this.ctx.drawImage(this.sprFlames, frame*SQUARE_SIZE, f.get('type')*SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE,
                x, y, SQUARE_SIZE, SQUARE_SIZE);

        },

        drawBomb: function(b) {
            var frame = Math.floor(b.get('frame') / BOMB_ANIM_SPEED);

            frame = frame % 3;

            var x = b.get('x') * SQUARE_SIZE;
            var y = b.get('y') * SQUARE_SIZE;

            this.ctx.drawImage(this.sprBomb, frame*SQUARE_SIZE, 0, SQUARE_SIZE, SQUARE_SIZE,
                x, y, SQUARE_SIZE, SQUARE_SIZE);
        }

    });

});