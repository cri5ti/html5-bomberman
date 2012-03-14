

define([
    "jquery", "underscore", "backbone",

    "Sprite"
],function($, _, Backbone, core) {


    var CENTER = 0;
    var VERTICAL = 1;
    var HORIZONTAL = 2;
    var END_UP = 3;
    var END_RIGHT = 4;
    var END_DOWN = 5;
    var END_LEFT = 6;


    BreakingTile = Sprite.extend({
        defaults: {
            x: 0,
            y: 0
        }
    });


    Flame = Sprite.extend({

        defaults: {
            x: 0,
            y: 0,
            type: 0,
            owner: -1
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
            this.set('frame', 0);
        }

    });


});