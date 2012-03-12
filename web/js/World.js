

define([
    "jquery", "underscore", "backbone",

    "Map",
    "Bomb",
    "Flame",
    "Character",

    "GameCanvas"
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

        /** bombs */
        bombs: new BombsCollection,
        /** queue of bombs to be placed */
        placeBombs: new BombsCollection,
        /** bomb views, keyed by Bomb */
        bombViews: [],

        flames: new FlamesCollection(),

        /** obsolete, NPC players */
        npcs: [],

        initialize: function(opt) {
            this.$container = opt.container;

            this.map = new Map();
            this.mapView = new MapView({model: this.map});
            this.$container.append(this.mapView.el);

            this.bombs.on('add', this.onBombAdded, this);
            this.bombs.on('remove', this.onBombRemoved, this);

            this.canvas = new GameCanvas({world: this});

            if (opt.player) {
                // create our player
                this.player = new Character({
                    name: opt.myName,
                    character: characters[Math.floor(Math.random()*(characters.length))]
                });
                this.players.add(this.player);
            }
        },

// FIXME
//        onCharacterAdded: function(c) {
//            // create a view for the character
//            var cv = new CharacterView({model: c});
//            this.playerViews.push(cv);
//            this.$container.append(cv.el);
//
//            this.updateScoring(true);
//        },
//
//        onCharacterRemoved: function(c) {
//            var cv = _.find(this.playerViews, function(v) { return v.model == c });
//            cv.$el.remove();
//
//            this.updateScoring(true);
//        },

        /** bombs */
        placeBomb: function(x, y) {
            // add on temporary queue
            this.placeBombs.add(new Bomb({x: x, y: y}));
        },

        explodeBomb: function(b, strength) {
            this.bombs.remove(b);

            var bx = b.get('x');
            var by = b.get('y');
            var owner = b.get('owner');

            _.each(ortho,_.bind(function(o) {
                for(var i=1; i<=strength; i++) {
                    var fx = bx + o.x * i;
                    var fy = by + o.y * i;

                    if (this.map.getTile(fx, fy) != 0)
                        return; // stop on obstacle

                    this.addMergeFlame(fx, fy, i == strength ? o.e : o.d, owner);

                    if (o.d == 0) return; // special case for center
                }
            },this));

            throttlePlay('explode-break');
        },


        addMergeFlame: function(x, y, type, owner) {

            var ef = this.map.getFlame(x,y);

            if (ef) {
                // merge
                ef.mergeWith(type);

                if (owner != this.player.id)
                    ef.set('owner', owner);
            } else {
                // add new
                ef = new Flame({x: x, y: y, type: type, owner: owner});
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

//        onFlameAdded: function(f) {
//            var fv = new FlameView({ model: f });
//            this.$container.append(fv.el);
//            this.flamesView.push(fv);
//        },

        onFlameRemoved: function(f) {
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

            this.canvas.update(dt);
        },

        updateScoring: function(recreate) {
            var $st = $("#score-table");
            if (recreate) {
                $st.empty();
                _.each(this.players.sortBy(function(p) { return -p.get('score'); }), function(p) {
                    var si = $(scoreItem({name: p.get('name'), score: p.get('score'), color: p.get('character')}));
                    $st.append(si);
                });
            }
        }
    });

    var scoreItem = _.template('<div class="score-item color-<%= color %>"><div class="player"><%= name %></div><div class="score"><%= score %></div></div>');

    var throttlePlay = _.throttle(function(snd) {
        play(snd)
    }, 50);

});