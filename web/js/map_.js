

define([
    "jquery", "underscore", "backbone"

],function($, _, Backbone, core) {


    var TILE_SIZE = 16;


    Map = Backbone.Model.extend({
        defaults: {
            map: null,
            x: 0,
            y: 0,
            width: 0,
            height: 0
        },

        initialize: function() {
            this.on('change', this.onChange, this);
        },

        onChange: function() {
            // for quick access
            this.map = this.get('map');
            this.w = this.get('width');
            this.h = this.get('width');
            this.x = this.get('x');
            this.y = this.get('y');

            if (this.hasChanged('width') || this.hasChanged('height')) {
                console.log("resizing flames map");

                this.flames = new Array(this.w * this.h);
                this.bombs = new Array(this.w * this.h);
            }
        },

        getTile: function(x, y) { return this._getMap(x, y, this.map)*1; },

        getFlame: function(x, y) { return this._getMap(x, y, this.flames); },
        setFlame: function(x, y, f) { this._setMap(x, y, f, this.flames); },

        getBomb: function(x, y) { return this._getMap(x, y, this.bombs); },
        setBomb: function(x, y, b) { this._setMap(x, y, b, this.bombs); },

        canMove: function(ox, oy, tx, ty) {
            // tile collision
            if (this.getTile(tx, ty) != TILE_EMPTY)
                return false;

            // bomb collision
            if ( (ox!=tx || oy!=ty) && this.getBomb(tx, ty) != null)
                return false;

            return true;
        },

        _getMap: function(x, y, arr) {
            return arr[ (y - this.y) * this.w + (x - this.x) ];
        },

        _setMap: function(x, y, v, arr) {
            arr[ (y - this.y) * this.w + (x - this.x) ] = v;
        }
    });

    MapView = Backbone.View.extend({

        initialize: function(opt) {
            this.loadTiles();

            this.$canvas = $('<canvas/>');
            this.canvas = this.$canvas.get(0);
            this.ctx = this.canvas.getContext("2d");

            this.model = opt.model;

            this.model.on('change', this.mapChange, this);
        },

        loadTiles: function() {
            this.$tiles = $('<img>');
            this.$tiles.load(_.bind(function() {
                this.inited = true;
                if (this.model.get('map') === null) return;
                this.render();
            },this));
            this.$tiles.attr('src', '/res/tiles.png');
        },

        mapChange: function() {
            if (!this.inited) return;
            this.render();
        },

        render: function() {
            // No canvas?
            if (this.canvas.getContext == undefined)
				G_vmlCanvasManager.initElement(this.canvas);

            var x = this.model.get('x');
            var y = this.model.get('y');
            var w = this.model.get('width');
            var h = this.model.get('height');

            this.$canvas.attr({
                width: w * TILE_SIZE,
                height: h * TILE_SIZE
            });

            var ctx = this.ctx;
            ctx.clearRect(0, 0, w, h);

            var tilesImg = this.$tiles.get(0);

            for(var i=0; i<w; i++) {
                for(var j=0; j<h; j++) {
                    var tile = this.model.getTile(i+x,j+y);
                    ctx.drawImage(tilesImg, tile*TILE_SIZE, 0,
                        TILE_SIZE, TILE_SIZE,
                        i*TILE_SIZE, j*TILE_SIZE,
                        TILE_SIZE, TILE_SIZE);
                }
            }

        }


    });


});