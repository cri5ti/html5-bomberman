

define([
    "jquery", "underscore", "backbone",
    "map",
    "Character", "CharacterView",
],function($, _, Backbone, core) {


    var characters = ["john", "mary", "joe", "betty"];


    PlayerCollection = Backbone.Collection.extend({

    });


    World = Backbone.Model.extend({

        /** element to hold the map into */
        $container: null,

        map: null,
        mapView: null,

        /** our player */
        player: null,

        /** all players */
        players: new PlayerCollection,

        /** all player views */
        playerViews: [],

        /** obsolete, NPC players */
        npcs: [],

        initialize: function(opt) {
            this.$container = opt.container;

            this.map = new Map();
            this.mapView = new MapView({model: this.map});
            this.$container.append(this.mapView.el);

            this.players.on('add', this.onCharacterAdded, this);
            this.players.on('remove', this.onCharacterRemoved, this);

            if (opt.player) {
                // create our player
                this.player = new Character({
                    name: "John" + Math.floor(Math.random()*100),
                    character: characters[Math.floor(Math.random()*(characters.length))]
                });
                this.players.add(this.player);
            }

            for(var i=0; i<opt.npcs; i++) {
                // create a npc
                this.players.add(new NpcCharacter({
                    x: Math.random()*300 + 50,
                    y: Math.random()*300 + 50,
                    character: characters[Math.floor(Math.random()*(characters.length-1))+1]
                }));
            }
        },


        onCharacterAdded: function(c) {
            // create a view for the character
            var cv = new CharacterView({model: c});
            this.playerViews.push(cv);
            this.$container.append(cv.el);
        },

        onCharacterRemoved: function(c) {
            var cv = _.find(this.playerViews, function(v) { return v.model == c });
            cv.$el.remove();
        },

        update: function(dt) {
            this.players.each(function(p) {
                p.update(dt);
            });

            _.each(this.playerViews, function(pv) {
                pv.update(dt);
            });
        }
    });





});