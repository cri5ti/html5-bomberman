/**
 * Created by JetBrains WebStorm.
 * User: cristi
 * Date: 01/03/2012
 * Time: 12:28
 * To change this template use File | Settings | File Templates.
 */



define([
    "jquery", "underscore", "backbone",
],function($, _, Backbone, core) {


    Character = Backbone.Model.extend({
        defaults: {
            character: 'john',
            x: 0,
            y: 0,
            orient: 'down',
            moving: false,
            chat: ''
        },

        deltaMove: function(x, y) {
            this.set('x', this.get('x') + x);
            this.set('y', this.get('y') + y);

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





});