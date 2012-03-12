
define([
    "jquery", "underscore", "backbone"
], function($, _, Backbone) {


    Sprite = Backbone.Model.extend({

        initialize: function() {
            this.set('frame', 0);
        },

        update: function(dt) {
            this.set('frame', this.get('frame') + dt);
        }
    });


});
