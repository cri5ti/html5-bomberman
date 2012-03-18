
(function() {

    const DIRECTIONS = [
        {x: 1, y: 0, zero:true},
        {x:-1, y: 0},
        {x: 0, y: 1},
        {x: 0, y:-1}
    ];

    function getTicks() {
        return new Date().getTime();
    }

    Game = Backbone.Model.extend({

        defaults: {
            endPoint: 'game'
        },

        bombs: null,

        initialize: function(opt) {
            this.redis = opt.redis;

            this.map = new Map();

            this.playersById = {};
            this.ctrlsById = {};
            this.maxPlayerId = 0;

            this.bombs = new BombCollection();
            this.bombs.on('add', this.onBombAdded, this);

            // TODO move outside game
            this.lastTick = getTicks();
            setInterval(_.bind(this.update, this), 100);

            // map updates
            setInterval(_.bind(function() {
                this.map.update(this, getTicks());
            }, this), 20000);
        },

        generatePlayerId: function() {
            return ++this.maxPlayerId;
        },

        update: function() {
            var now = getTicks();

            // check bombs
            this.bombs.each(function(b) {
                if (b.get('timeTrigger')<=now) {
                    this.explodeBomb(b);
                }
            }, this);

            // check player spawning
            _.each(this.playersById, function(p) {
                if (!p.get('alive') && p.get('spawnAt')<=now)
                    this.spawnPlayer(p);
            }, this);

            this.lastTick = now;
        },

        spawnPlayer: function(p) {
            this.ctrlsById[p.id].spawnPlayer();
        },

        onBombAdded: function(b) {
            b.set({
                timePlaced: this.lastTick,
                timeTrigger: this.lastTick + b.get('fuseTime')
            });
        },

        _chainBombs: function(b) {
            this.bombs.remove(b);
            this.chained.push(b);

            // build chained bombs
            this.each4Ways(b.get('x'), b.get('y'), b.get('strength'),
                _.bind(function(x,y) {
                    var cb;
                    if (cb = this.getBomb(x, y)) {
                        this._chainBombs(cb);
                    }
                }, this),
                _.bind(function(x, y, t) {
                    if (t == TILE_BRICK)
                        this.blocks.push( {x: x, y: y} );
                }, this)
            );
        },

        explodeBomb: function(b) {
            this.chained = [];
            this.blocks = [];

            this._chainBombs(b);

            _.each(this.blocks, function(b) {
                this.map.setAbsMap(b.x, b.y, TILE_EMPTY, false);
            }, this);

            this.endpoint.emit('break-tiles', this.blocks);
        },

        /**
         * Iterates valid flame points
         * @param x
         * @param y
         * @param len
         * @param f1 = function(x, y) - free space
         * @param f2 = function(x, y, type) - collision
         */
        each4Ways: function(x, y, len, f1, f2) {
            _.each(DIRECTIONS, _.bind(function(dir) {
                for(var i=0; i<=len; i++) {
                    if (i==0 && dir.zero === undefined) continue; // allow only one zero
                    var xx = x + dir.x*i;
                    var yy = y + dir.y*i;
                    var tt = this.map.getAbsTile( xx, yy );
                    if (tt != TILE_EMPTY) {
                        if (f2!==undefined) f2(xx, yy, tt);
                        return;
                    }
                    f1(xx,yy);
                }
            }, this));
        },

        getBomb: function(x,y) {
            return this.bombs.find(function(b) { return b.get('x') == x && b.get('y') == y; });
        },

        scoreKill: function(whoId, byWhoId) {
            var who = this.playersById[whoId];
            if (!who) return;

            this.redis.incr("counters.kills");

            if (whoId == byWhoId) { // suicide
                console.log(who.get('name') + " suicided");
                who.set('score', who.get('score') - 1);

                this.redis.incr("counters.kills.suicides");

                this.redis.incr("suicides-by:" + whoId);
            } else {
                var byWho = this.playersById[byWhoId];
                if (!byWho) return;

                console.log(who.get('name') + " was killed by " + byWho.get('name'));
                byWho.set('score', byWho.get('score') + 1);

                this.redis.incr("counters.kills.kills");

                this.redis.incr("kills-by:" + byWhoId);

                if (who.get('fbuid')>0 && byWho.get('fbuid') > 0)
                    this.redis.incr("kill:" + who.get('fbuid') + ":by:" + byWho.get('fbuid'));

                this.ctrlsById[whoId].notifyFriendBattles();
                this.ctrlsById[byWhoId].notifyFriendBattles();
            }
            this.trigger('score-changes');
        }

    });


})();