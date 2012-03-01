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

    var orients = ['up', 'right', 'down', 'left'];
    var i=0;

    Character = Backbone.Model.extend({
        defaults: {
            character: 'john',
            chat: '',
            x: 100,
            y: 100,
            orient: 'up'
        },

        deltaMove: function(x, y) {
            this.set('x', this.get('x') + x*5);
            this.set('y', this.get('y') + y*5);

            if (x<0)
                this.set('orient', 'left');
            else if (x>0)
                this.set('orient', 'right');
            else if (y<0)
                this.set('orient', 'up');
            else if (y>0)
                this.set('orient', 'down');
        },

        update: function() {
            // nothing to do..
        },

        sendMessage: function(msg) {
            this.set('chat', msg);
        }
    });


    NpcCharacter = Character.extend({
        defaults: _.extend({}, Character.prototype.defaults, {
                moveDirection: 0,
                moveCount: 5
        }),

        update: function() {
            // finished last thought
            if (this.get('moveCount')<=0) {
                this.set('moveCount', Math.floor(Math.random()*5+2));
                this.set('moveDirection', Math.floor(Math.random()*4));
            }

            // move
            this.set('moveCount', this.get('moveCount')-1);

            if (this.get('moveDirection')==0)
                this.deltaMove(0,-1);
            else if (this.get('moveDirection')==1)
                this.deltaMove(1,0);
            else if (this.get('moveDirection')==2)
                this.deltaMove(0,1);
            else if (this.get('moveDirection')==3)
                this.deltaMove(-1,0);
        }
    });

//    ________________________________________________________________________


    CharacterView = Backbone.View.extend({
        className: 'john',

        initialize: function() {
            this.render();
            this.update();
            this.model.on('change', this.update, this);
        },

        update: function() {
            if (this.model.hasChanged("chat")) {
                if (this.model.get('chat')) {
                    this.$bubble.text(this.model.get('chat'));
                    this.$bubble.show();
                } else {
                    this.$bubble.hide();
                }
            }

            var classes = this.model.get('character') + ' ' + this.model.get('orient');
            this.$el.attr('class', classes);
            this.$el.css({
                left: this.model.get('x'),
                top: this.model.get('y')
            });
        },

        render: function() {
            this.$bubble = $('<div class="bubble"></div>');
            this.$bubble.hide();
            this.$el.append(this.$bubble)
        }

    });


});
