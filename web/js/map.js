/**
 * Created by JetBrains WebStorm.
 * User: cristi
 * Date: 01/03/2012
 * Time: 14:09
 * To change this template use File | Settings | File Templates.
 */


define([
    "jquery", "underscore", "backbone",

],function($, _, Backbone, core) {


    const TILE_SIZE = 16;


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
        },

        getAbsTile: function(x, y) {
            return this.getTile(x - this.x, y - this.y);
        },

        getTile: function(x, y) {
            var c = this.map[ y * this.w + x ];
            return c*1;
        }

    });

    MapView = Backbone.View.extend({

        initialize: function(opt) {
            this.loadTiles();

            this.$canvas = $('<canvas/>');
            this.$canvas.css({position: 'absolute'});
            this.$el.append(this.$canvas);
            this.canvas = this.$canvas.get(0);

            this.model = opt.model;

            this.model.on('change', this.mapChange, this);
        },

        loadTiles: function() {
            this.$tiles = $('<img src="/res/tiles.png">');
            this.$tiles.load(_.bind(function() {
                this.inited = true;
                if (this.model.get('map') === null) return;
                this.render();
            },this));
        },

        mapChange: function() {
            if (!this.inited) return;
            this.render();
        },

        render: function() {
            var w = this.model.get('width');
            var h = this.model.get('height');

            this.$canvas.attr({
                width: w * TILE_SIZE,
                height: h * TILE_SIZE
            });

            this.$canvas.css({
                left: this.model.get('x') * TILE_SIZE,
                top: this.model.get('y') * TILE_SIZE
            })

            var ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, w, h);

            var tilesImg = this.$tiles.get(0);

            for(var i=0; i<w; i++)
                for(var j=0; j<h; j++)
                {
                    var tile = this.model.getTile(i,j);
                    ctx.drawImage(tilesImg, tile*TILE_SIZE, 0,
                        TILE_SIZE, TILE_SIZE,
                        i*TILE_SIZE, j*TILE_SIZE,
                        TILE_SIZE, TILE_SIZE);
                }

        }


    });


});