

define([
    "jquery", "underscore", "backbone",
    "map", "bomb", "flames",
    "Character", "CharacterView",
],function($, _, Backbone, core) {


    var characters = ["john", "mary", "joe", "betty"];

    var ortho = [
        {x:0, y:0, d: 0 },
        {x:1, y:0, e: 4, d: 2},
        {x:-1, y:0, e: 6, d: 2},
        {x:0, y:-1, e: 3, d: 1},
        {x:0, y:1, e: 5, d: 1}
    ];

    PlayerCollection = Backbone.Collection.extend({});

    BombsCollection = Backbone.Collection.extend({});

    FlamesCollection = Backbone.Collection.extend({
        initialize: function() {
            this.on('add', this.onFlameAdded, this);
        },

        onFlameAdded: function(f) {
            f.on('done', this.onFlameDone, this);
        },

        onFlameDone: function(f) {
            this.remove(f);
        }
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

        /** bombs */
        bombs: new BombsCollection,
        /** queue of bombs to be placed */
        placeBombs: new BombsCollection,
        /** bomb views, keyed by Bomb */
        bombViews: [],

        flames: null,//FlamesCollection//,
        flamesView: [],

        /** obsolete, NPC players */
        npcs: [],

        initialize: function(opt) {
            this.$container = opt.container;

            this.map = new Map();
            this.mapView = new MapView({model: this.map});
            this.$container.append(this.mapView.el);

            this.players.on('add', this.onCharacterAdded, this);
            this.players.on('remove', this.onCharacterRemoved, this);

            this.bombs.on('add', this.onBombAdded, this);
            this.bombs.on('remove', this.onBombRemoved, this);

            this.flames = new FlamesCollection();
            this.flames.on('add', this.onFlameAdded, this);
            this.flames.on('remove', this.onFlameRemoved, this);

            if (opt.player) {
                // create our player
                this.player = new Character({
                    name: opt.myName,
                    character: characters[Math.floor(Math.random()*(characters.length))]
                });
                this.players.add(this.player);
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
            // TODO FIXME: this.playerViews.remove
        },

        /** bombs */
        placeBomb: function(x, y) {
            // add on temporary queue
            this.placeBombs.add(new Bomb({x: x, y: y}));
        },

        explodeBomb: function(b, strength) {
            this.bombs.remove(b);

            var bx = b.get('x');
            var by = b.get('y');

            _.each(ortho,_.bind(function(o) {
                for(var i=1; i<=strength; i++) {
                    var fx = bx + o.x * i;
                    var fy = by + o.y * i;

                    if (this.map.getTile(fx, fy) != 0)
                        return; // stop on obstacle

                    this.addMergeFlame(fx, fy, i == strength ? o.e : o.d);

                    if (o.d == 0) return; // special case for center
                }
            },this));
        },

        addMergeFlame: function(x, y, type) {

            var ef = this.map.getFlame(x,y);

            if (ef) {
                // merge
                ef.mergeWith(type);
            } else {
                // add new
                ef = new Flame({x: x, y: y, type: type});
                this.flames.add(ef);
                this.map.setFlame(x, y, ef);
            }
        },

        onBombAdded: function(b) {
            var bv = new BombView({model: b});
            this.$container.append(bv.el);
            this.bombViews.push(bv);

            this.map.setBomb(b.get('x'), b.get('y'), b);
        },

        onBombRemoved: function(b) {
            var bv = _.find(this.bombViews, function(v) { return v.model == b });
            bv.$el.remove();

            var bvi = this.bombViews.indexOf(bv);
            this.bombViews.splice(bvi, 1);

            this.map.setBomb(b.get('x'), b.get('y'), null);
        },

        onFlameAdded: function(f) {
            var fv = new FlameView({ model: f });
            this.$container.append(fv.el);
            this.flamesView.push(fv);
        },

        onFlameRemoved: function(f) {
            var fv = _.find(this.flamesView, function(v) { return v.model == f });
            fv.$el.remove();

            var fvi = this.flamesView.indexOf(fv);
            this.flamesView.splice(fvi, 1);

            this.map.setFlame(f.get('x'), f.get('y'), null);
        },

        update: function(dt) {

            this.players.each(function(p) {
                p.update(dt);
            });

            _.each(this.playerViews, function(pv) {
                pv.update(dt);
            });

            _.each(this.bombViews, function(bv){
                bv.update(dt);
            });

            _.each(this.flamesView, function(fv){
                fv.update(dt);
            });
        }
    });





});