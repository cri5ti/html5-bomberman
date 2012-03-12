

define([
    "jquery", "underscore", "backbone",
],function($, _, Backbone, core) {

    var ORIENT_DOWN = 0;
    var ORIENT_UP = 1;
    var ORIENT_RIGHT = 2;
    var ORIENT_LEFT = 3;

    var MOVE_ANIM_SPEED = 0.15;

    Sprite = Backbone.Model.extend({

        initialize: function() {
            this.set('frame', 0);
        },

        update: function(dt) {
            this.set('frame', this.get('frame') + dt);
        }
    });

    Character = Sprite.extend({
        defaults: {
            name: '?',
            character: 'john',
            x: 0,
            y: 0,
            orient: ORIENT_DOWN,
            moving: false,
            dead: true,
            score: 0
        },

        deltaMove: function(x, y) {
            this.set('x', this.get('x') + x);
            this.set('y', this.get('y') + y);

            if (x<0)
                this.set('orient', ORIENT_LEFT);
            else if (x>0)
                this.set('orient', ORIENT_RIGHT);
            else if (y<0)
                this.set('orient', ORIENT_UP);
            else if (y>0)
                this.set('orient', ORIENT_DOWN);
        },

        die: function(flame) {
            this.set('dead', true);
            this.trigger('die', flame);
            this.set('frame', 0);
        },

        sendMessage: function(msg) {
            this.set('chat', msg);
        }
    });

});