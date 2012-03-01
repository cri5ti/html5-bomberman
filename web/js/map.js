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


    MapView = Backbone.View.extend({


        initialize: function() {
            this.render();

            this.loadTiles();
        },

        loadTiles: function() {
            this.tilesImg = $('<img>');
            this.tile
        },

        render: function() {
            var canvas = $('<canvas/>');

            this.$el.append(canvas);

            var ctx = canvas.get(0).getContext("2d");
            ctx.strokeStyle = 'red';

            ctx.moveTo(10, 10);
            ctx.lineTo(100, 20);
            ctx.stroke();
        }


    });


});