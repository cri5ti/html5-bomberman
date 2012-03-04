

(function() {

    Bomb = Backbone.Model.extend({
        defaults: {
            x: 0,
            y: 0,
            timePlaced: 0,
            timeTrigger: 0,
            fuseTime: 2500,
            strength: 4
        }
    });


    BombCollection = Backbone.Collection.extend({
    });



})();