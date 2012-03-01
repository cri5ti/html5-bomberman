/**
 * Created by JetBrains WebStorm.
 * User: cristi
 * Date: 29/02/2012
 * Time: 12:43
 * To change this template use File | Settings | File Templates.
 */

define([
    "jquery", "underscore", "backbone",
],function($, _, Backbone, core) {


    const MOVE_ANIM_SPEED = 0.25;
    const SQUARE_SIZE = 16;

    var tmp = 0;

    CharacterView = Backbone.View.extend({
        className: 'john',

        initialize: function() {
            this.render();
            this.modelChange(true);
            this.model.on('change', this.modelChange, this);
        },

        modelChange: function(init) {
            if (this.model.hasChanged("chat"))
            {
                if (this.model.get('chat')) {
                    this.$bubble.text(this.model.get('chat'));
                    this.$bubble.show();
                } else {
                    this.$bubble.hide();
                }
            }

            if (this.model.hasChanged("character") || init) {
                var classes = this.model.get('character') + ' ' + this.model.get('orient');
                this.$el.attr('class', classes);
            }
        },

        update: function(dt) {
            tmp += dt;

            var frame = Math.floor(tmp / MOVE_ANIM_SPEED);
            frame = frame % 3;
            if (!this.model.get('moving')) frame = 1;

            var o = this.model.get('orient');

            var x = this.model.get('x') * SQUARE_SIZE;
            var y = this.model.get('y') * SQUARE_SIZE;

            this.$el.css({
                left: x - 11,
                top: y - 16,
                'background-position-x': -(frame*22)+'px',
                'background-position-y': -(o*22)+'px',
                'z-index': y
            });
        },

        render: function() {
            this.$bubble = $('<div class="bubble"></div>');
            this.$bubble.hide();

            this.$el.append(this.$bubble)
        }

    });


});
