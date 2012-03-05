

define([
    "jquery", "underscore", "backbone",
],function($, _, Backbone, core) {


    var MOVE_ANIM_SPEED = 0.15;
    var SQUARE_SIZE = 16;

    CharacterView = Backbone.View.extend({
        className: 'john',

        initialize: function() {
            this.frame = 0;

            this.$bubble = $('<div class="bubble"></div>');
            this.$bubble.text(this.model.get('name'));
            this.$bubble.hide();
            this.$el.append(this.$bubble);

            this.model.on('change', this.modelChange, this);
            this.model.on('die', this.hasDied, this);

            this.modelChange(true);

        },

        events: {
            "mouseenter": function() { this.$bubble.show(); },
            "mouseleave": function() { this.$bubble.hide(); }
        },

        modelChange: function(init) {
            if (this.model.hasChanged("name"))
                this.$bubble.text(this.model.get('name'));

            if (this.model.hasChanged("character") || init) {
                var classes = 'character ' + this.model.get('character');
                this.$el.attr('class', classes);
            }
            this.update(0);
        },

        hasDied: function() {
            this.frame = 0;
        },

        update: function(dt) {
            this.frame += dt;

            var frame = Math.floor(this.frame / MOVE_ANIM_SPEED);
            var framex;

            if (!this.model.get('dead')) {
                // alive
                framex = frame % 3;
                if (!this.model.get('moving')) framex = 1;
                var framey = this.model.get('orient');
            } else {
                // dead
                framey = Math.floor(frame / 3) + 4;
                framex = frame % 3;
            }

            var x = this.model.get('x') * SQUARE_SIZE;
            var y = this.model.get('y') * SQUARE_SIZE;
            var z = Math.floor(this.model.get('y'));

            this.$el.css({
                left: x - 11,
                top: y - 16,
                'background-position': (-framex*22)+'px ' + (-framey*22)+'px',
                'z-index': z
            });
        }

    });


});
