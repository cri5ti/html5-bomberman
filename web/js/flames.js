

define([
    "jquery", "underscore", "backbone",

],function($, _, Backbone, core) {


    var MOVE_ANIM_SPEED =0.15;
    var SQUARE_SIZE = 16;

    var CENTER = 0;
    var VERTICAL = 1;
    var HORIZONTAL = 2;
    var END_UP = 3;
    var END_RIGHT = 4;
    var END_DOWN = 5;
    var END_LEFT = 6;

    Flame = Backbone.Model.extend({
        defaults: {
            x: 0,
            y: 0,
            type: 0,
            owner: -1
        },

        initialize: function() {
        },

        mergeWith: function(nt) {
            var t = this.get('type');

            if (t == nt)            t = nt; // no change
            else if (t == CENTER)   t = CENTER;
            else if (nt == CENTER)  t = CENTER;
            else if (t==HORIZONTAL && nt==VERTICAL) t = CENTER;
            else if (t==VERTICAL && nt==HORIZONTAL) t = CENTER;

            else if (t==HORIZONTAL && (nt==END_LEFT||nt==END_RIGHT)) t = HORIZONTAL;
            else if (nt==HORIZONTAL && (t==END_LEFT||t==END_RIGHT))  t = HORIZONTAL;

            else if (t==VERTICAL && (nt==END_UP||nt==END_DOWN)) t = VERTICAL;
            else if (nt==VERTICAL && (t==END_UP||t==END_DOWN))  t = VERTICAL;

            else if (t >= END_UP && nt >= END_UP) t = nt;

            this.set('type', t);
            this.trigger('merged');


        }

    });

    FlameView = Backbone.View.extend({
        className: 'sprite flame',

        initialize: function(opt) {
            this.frame = 0;

            this.model = opt.model;
            this.model.on('change', this.modelChange, this);
            this.model.on('merged', this.modelMerged, this);
            this.update(0);
        },

        modelChange: function() {
            this.update(0);
        },

        modelMerged: function() {
            this.frame = 0;
            this.update(0);
        },

        update: function(dt) {
            this.frame += dt;
            var frame = Math.floor(this.frame / MOVE_ANIM_SPEED);
            if (frame > 8) {
                // end of flame
                if (!this.done) {
                    this.done = true;
                    this.model.trigger('done', this.model);
                }
                return;
            }
            if (frame > 4) frame = 8 - frame;

            // frames go like this:
            // 0 1 2 3 4 5 6 7 8
            // 0 1 2 3 4 3 2 1 0

            var x = this.model.get('x') * SQUARE_SIZE;
            var y = this.model.get('y') * SQUARE_SIZE;

            this.$el.css({
                left: x,
                top: y,
                'background-position': (-frame*16)+'px ' + (-this.model.get('type')*16)+'px'
            });
        }
    });


});