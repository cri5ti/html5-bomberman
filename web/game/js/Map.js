

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
            height: 0,
            initialized: false
        },



        initialize: function() {
            this.on('change', this.onChange, this);

            this.dirtMap = [];
        },

        onChange: function() {
            // for quick access
            this.map = this.get('map');
            this.w = this.get('width');
            this.h = this.get('width');
            this.x = this.get('x');
            this.y = this.get('y');
            console.log("MAP changed");

            if (this.hasChanged('width') || this.hasChanged('height')) {
                console.log("resizing flames map");

                this.flames = new Array(this.w * this.h);
                this.bombs = new Array(this.w * this.h);

                this.setDirty();
            }
        },

        setDirty: function(x, y, w, h) {
            if (this.gameCanvas)
                this.gameCanvas.mapDirty(x, y, w, h);
        },

        getTile: function(x, y) { return this._getMap(x, y, this.map)*1; },
//        setTile: function(x, y, t) { this._setMap(x, y, t, this.map); },


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
        },

        setTile: function(x, y, c) {
            var ix = (y - this.y) * this.w + (x - this.x);
            this.map = this.map.substr(0, ix) + c + this.map.substr(ix+1);
        }
    });


});