

define([
    "jquery", "underscore", "backbone",

],function($, _, Backbone, core) {


    var MOVE_ANIM_SPEED = 0.15;
    var SQUARE_SIZE = 16;

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
            var z = this.model.get('y') - 1;

            this.$el.css({
                left: x,
                top: y,
                'background-position': -(frame*16)+'px 0',
                'z-index': z
            });
        }
    });


});