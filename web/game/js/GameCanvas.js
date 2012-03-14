
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

    var VIEW_W = 40;
    var VIEW_H = 25;

    GameCanvas = Backbone.View.extend({

        initialize: function(opt) {
            this.world = opt.world;

            this.world.map.gameCanvas = this;

            // canvas
            this.$canvas = this._canvas(VIEW_W * SQUARE_SIZE, VIEW_H * SQUARE_SIZE);
            this.ctx = this.$canvas.get(0).getContext("2d");

            this.world.$container.append(this.$canvas);
            this.world.$container.css({
                width: (VIEW_W * SQUARE_SIZE) + 'px',
                height: (VIEW_H * SQUARE_SIZE) + 'px',
                'margin-left': -(VIEW_W * SQUARE_SIZE / 2) + 'px'
            });

            // map layer
            this.map = this._canvas( (VIEW_W+2) * SQUARE_SIZE, (VIEW_H+2) * SQUARE_SIZE).get(0);

            this.mapDirts = [];

            // load sprites
            this.sprCharacters = {};
            _.each(['john','joe','betty','mary'], _.bind(function(c) {
                this.sprCharacters[c] = this._loadSprite("res/char-"+c+".png");
            }, this));

            this.sprFlames = this._loadSprite('res/flames.png');

            this.sprBomb = this._loadSprite('res/bombs.png');

            this.sprTiles = this._loadSprite('res/tiles.png');
        },

        _canvas: function(w, h) {
            var $canvas = $('<canvas width="'+w+'" height="'+h+'"/>');

            // Has canvas support?
            if ($canvas.get(0).getContext == undefined)
                G_vmlCanvasManager.initElement($canvas.get(0));

            return $canvas;
        },

        _loadSprite: function(res) {
            return $('<img src="'+res+'"/>').get(0);
        },

        update: function(dt) {

            this.computeViewport();

            this.drawMap();

            this.world.flames.each(_.bind(this.drawFlame, this));

            this.world.bombs.each(_.bind(this.drawBomb, this));

            this.world.players.sort().each(_.bind(this.drawCharacter, this));

            this.world.breakings.each(_.bind(this.drawBreaking, this));
        },

        computeViewport: function() {
            if (!this.viewport) {
                this.viewport = {
                    x: 0, y: 0,
                    w: VIEW_W + 2, h: VIEW_H + 2,
                    rw: VIEW_W, rh: VIEW_H
                }
            }

            var vp = this.viewport;
            var mp = this.world.map.attributes;

            var W3 = VIEW_W * 0.4;
            var H3 = VIEW_H * 0.4;

            var px = this.world.player.get('x');
            var py = this.world.player.get('y');

            if (px > vp.x + vp.rw - W3)  vp.x = px + W3 - vp.rw;
            if (px < vp.x + W3)         vp.x = px - W3;

            if (py > vp.y + vp.rh - H3)  vp.y = py + H3 - vp.rh;
            if (py < vp.y + H3)         vp.y = py - H3;

            if (vp.x < mp.x) vp.x = mp.x;
            if (vp.y < mp.y) vp.y = mp.y;
            if (vp.x + vp.rw > mp.x + mp.width) vp.x = mp.x + mp.width - vp.rw;
            if (vp.y + vp.rh > mp.y + mp.height) vp.y = mp.y + mp.height - vp.rh;


            this.viewport.xx = Math.round( this.viewport.x * SQUARE_SIZE );
            this.viewport.yy = Math.round( this.viewport.y * SQUARE_SIZE );
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

            var x = Math.round( c.get('x') * SQUARE_SIZE ) - CHAR_CX - this.viewport.xx;
            var y = Math.round( c.get('y') * SQUARE_SIZE ) - CHAR_CY - this.viewport.yy;

            var spr = this.sprCharacters[c.get('character')];

            this.ctx.drawImage(spr, framex * CHAR_W, framey*CHAR_H, CHAR_W, CHAR_H,
                x, y, CHAR_H, CHAR_H);
        },

        drawFlame: function(f) {
            var frame = Math.floor(f.get('frame') / FLAME_ANIM_SPEED);

            if (frame > 6) {
                // end of flame
                f.trigger('done', f);
                return;
            }

            // reverse frames
            if (frame > 3) frame = 6 - frame;

            // frames go like this:
            // 0 1 2 3 4 5 6
            // 0 1 2 3 2 1 0

            var x = f.get('x') * SQUARE_SIZE - this.viewport.xx;
            var y = f.get('y') * SQUARE_SIZE - this.viewport.yy;

            this.ctx.drawImage(this.sprFlames,
                frame*SQUARE_SIZE, f.get('type')*SQUARE_SIZE,
                SQUARE_SIZE, SQUARE_SIZE,
                x, y,
                SQUARE_SIZE, SQUARE_SIZE);

        },

        drawBomb: function(b) {
            var frame = Math.floor(b.get('frame') / BOMB_ANIM_SPEED);

            frame = frame % 3;

            var x = b.get('x') * SQUARE_SIZE - this.viewport.xx;
            var y = b.get('y') * SQUARE_SIZE - this.viewport.yy;

            this.ctx.drawImage(this.sprBomb,
                frame*SQUARE_SIZE, 0,
                SQUARE_SIZE, SQUARE_SIZE,
                x, y,
                SQUARE_SIZE, SQUARE_SIZE);
        },

        drawBreaking: function(b) {
            var frame = Math.floor(b.get('frame') / FLAME_ANIM_SPEED);

            if (frame > 6) {
                // end of flame
                b.trigger('done', b);
                return;
            }

            var x = b.get('x') * SQUARE_SIZE - this.viewport.xx;
            var y = b.get('y') * SQUARE_SIZE - this.viewport.yy;

            this.ctx.drawImage(this.sprTiles,
                frame*SQUARE_SIZE, SQUARE_SIZE,
                SQUARE_SIZE, SQUARE_SIZE,
                x, y,
                SQUARE_SIZE, SQUARE_SIZE);
        },


        mapDirty: function(x,y,w,h) {
            if (this.mapRepaint) return;

            if (x == undefined)
                this.mapRepaint = true;
            else if (w == undefined)
                this.addDirtyZone(x,y,1,1);
            else
                this.addDirtyZone(x,y,w,h);
        },

        addDirtyZone: function(x,y,w,h) {
            var vp = this.viewport;

            if (x > vp.x + vp.w) return;
            if (y > vp.y + vp.h) return;

            if (x + w < vp.x) return;
            if (y + h < vp.y) return;

            if (x < vp.x) x = vp.x;
            if (y < vp.y) y = vp.y;

            if (x + w > vp.x + vp.w) w = vp.x + vp.w - x;
            if (y + h > vp.y + vp.h) h = vp.y + vp.h - y;

            this.mapDirts.push( {
                x: Math.floor(x), y: Math.floor(y),
                w: Math.ceil(w), h: Math.ceil(h)
            } );
        },

        drawMap: function() {

            var map = this.world.map;

            var mp = map.attributes;
            var vp = this.viewport;

            if (!mp.initialized) return;

            var ctx = this.map.getContext("2d");
            var tiles = this.sprTiles;

            var drawnTiles = 0;

            var x = Math.floor(vp.x);
            var y = Math.floor(vp.y);

            var ofx = Math.round( (vp.x - x) * SQUARE_SIZE );
            var ofy = Math.round( (vp.y - y) * SQUARE_SIZE );

            // TODO compute map deltas

            if (this.mapRepaint) {
                this.mapDirts = [];
            }
            else if (this.lastXY) {
                var dx = this.lastXY.x - x;
                var dy = this.lastXY.y - y;

                if (Math.abs(dx)>2 || Math.abs(dy)>2) {
                    // big jump, refresh all
                    this.mapDirty();
                }
                else if (dx != 0 || dy != 0) {
                    console.log(dx+":"+dy);

                    var ww = (vp.w) * SQUARE_SIZE;
                    var hh = (vp.h) * SQUARE_SIZE;

                    // shift old map
                    ctx.drawImage(this.map,
                        0, 0,
                        ww, hh,
                        dx * SQUARE_SIZE, dy * SQUARE_SIZE,
                        ww, hh
                    )

                    if (dx > 0) this.mapDirty(x + dx - 1, 0, dx, 100);
                    if (dy > 0) this.mapDirty(0, y + dy - 1, 100, dy);

                    if (dx < 0) this.mapDirty(x + vp.w + dx - 1, 0, -dx, 100);
                    if (dy < 0) this.mapDirty(0, y + vp.h + dy - 1, 100, -dy);
                }
            } else {
                this.mapDirty();
            }

            if (this.mapRepaint) {
                this.addDirtyZone(0,0,map.w,map.h);
            }

            var dm = this.mapDirts;

            // draw dirty zones
            for(var k=0, dl=dm.length; k<dl; k++) {
                var z = dm[k];

                for(var i=0; i<z.w; i++) {
                    for(var j=0; j<z.h; j++) {

                        var cx = i + z.x;
                        var cy = j + z.y;

                        var tile = map.getTile(cx, cy);

                        ctx.drawImage(tiles,
                            tile * SQUARE_SIZE, 0,
                            SQUARE_SIZE, SQUARE_SIZE,
                            (cx - x + 1) * SQUARE_SIZE, (cy - y + 1) * SQUARE_SIZE,
                            SQUARE_SIZE, SQUARE_SIZE);

                        drawnTiles++;
                    }
                }
            }

            this.lastXY = {x: x, y: y};

            // reset dirty zones
            this.mapDirts = [];
            this.mapRepaint = false;

            if (drawnTiles > 0)
                console.log("drawn " + drawnTiles);

            // FIXME
            this.ctx.drawImage(this.map,
                -ofx - SQUARE_SIZE,
                -ofy - SQUARE_SIZE
            );

        }


    });


});