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


    const MOVE_ANIM_SPEED = 0.15;
    const SQUARE_SIZE = 16;

    Bomb = Backbone.Model.extend({
        defaults: {
            x: 0,
            y: 0
        },

        initialize: function() {
        }
    });

    BombView = Backbone.View.extend({
        className: 'sprite bomb',

        initialize: function(opt) {
            this.frame = 0;

            this.model = opt.model;
            this.model.on('change', this.modelChange, this);
            this.update(0);
        },

        modelChange: function() {
            this.update(0);
        },

        update: function(dt) {
            this.frame += dt;

            var frame = Math.floor(this.frame / MOVE_ANIM_SPEED);
            frame = frame % 3;

            var x = this.model.get('x') * SQUARE_SIZE;
            var y = this.model.get('y') * SQUARE_SIZE;

            this.$el.css({
                left: x,
                top: y,
                'background-position-x': -(frame*16)+'px',
                'z-index': y
            });
        }
    });


});