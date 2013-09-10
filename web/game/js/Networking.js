
define([
    "jquery", "underscore", "backbone",
],function($, _, Backbone, core) {



    Networking = Backbone.Model.extend({

        initialize: function(opt) {
            this.id = -1;

            this.peers = {};

            this.world = opt.world;

            this.world.player.on('change', this.playerChange, this);
            this.world.player.on('die', this.playerDie, this);

            this.world.placeBombs.on('add', this.requestPlaceBomb, this);

            this.socket = io.connect(window.location.protocol + '//' + window.location.hostname + ':3000/' + opt.game);

            this.socket.on('disconnect', $.proxy(this.onDisconnect, this));

            this.socket.on('game-info', $.proxy(this.onGameJoin, this));
            this.socket.on('map', $.proxy(this.onMapUpdate, this));
            this.socket.on('player-joined', $.proxy(this.onPlayerJoined, this));
            this.socket.on('player-spawned', $.proxy(this.onPlayerSpawned, this));
            this.socket.on('player-update', $.proxy(this.onPlayerUpdated, this));
            this.socket.on('player-dying', $.proxy(this.onPlayerDying, this));
            this.socket.on('player-disconnected', $.proxy(this.onPlayerDisconnected, this));
            this.socket.on('chat', $.proxy(this.onChat, this));
            this.socket.on('laginfo', $.proxy(this.onPing, this));

            this.socket.on('score-updates', $.proxy(this.onScoreUpdates, this));
            this.socket.on('friend-scores', $.proxy(this.onFriendScoreUpdates, this));

            this.socket.on('bomb-placed', $.proxy(this.onBombPlaced, this));
            this.socket.on('bomb-boomed', $.proxy(this.onBombBoomed, this));

            this.socket.on('break-tiles', $.proxy(this.onTilesBroke, this));
        },

        onDisconnect: function() {
            $('#waitserver').show();

            _.each(this.peers, _.bind(function(p) {
                this.world.players.remove(p);
            }, this));
            this.peers = {};
        },

        onGameJoin: function(d) {
            $('#waitserver').hide();

            this.id = d.your_id;
            console.log("Welcome to game " + d.game + " (my id = " + this.id + ")");

            this.socket.emit('join', {
                id: this.id,
                fbuid: this.world.player.get('fbuid'),
                name: this.world.player.get('name'),
                character: this.world.player.get('character')
            });

            this.world.player.id = this.id;

            // mark ourself in the peer list
            this.peers[this.id] = this.world.player;
        },

        onMapUpdate: function(d) {
            this.world.map.set({
                x: d.x,
                y: d.y,
                width: d.w,
                height: d.h,
                map: d.map,
                initialized: true
            });
            this.world.map.setDirty();
            console.log("full map update");
        },

        onPlayerJoined: function(d) {
            d.name = _.escape(d.name);
            info("<u>" + d.name + "</u> joined");
            var c = new Character({
                id: d.id,
                name: d.name,
                character: d.character,
                score: d.score,
                fbuid: d.fbuid
            });
            console.log(d.name + " #" + d.id + " joined", c);
            this.world.players.add(c);
            this.peers[d.id] = c;
        },

        onPlayerSpawned: function(d) {
            var c = this.peers[d.id];
            if (!c) {
                // we don't know this guy
                console.log("#" + d.id + " spawned");
                return;
            }
            console.log(c.get('name') + " spawned");
            c.set({
                x: d.x,
                y: d.y,
                dead: false
            });

			if (d.id == this.id) {
                c.trigger('spawn');
                this.world.map.setDirty();
                // FIXME
//				var cv = _.find(this.world.playerViews, function(v) { return v.model == c });
//				cv.showSpawn();
			}

            play('spawn');
        },

        onPlayerDisconnected: function(d) {
            var c = this.peers[d.id];
            if (!c) return; // we don't know this guy
            info("<u>" + c.get('name') + "</u> disconnected");
            console.log(c.get('name') + " disconnected");

            this.world.players.remove(c);
            delete this.peers[d.id];

            play('disconnect');
        },

        onPlayerUpdated: function(d) {
            var c = this.peers[d.id];
            if (!c) {
                console.log("Update from unknown #"+ d.id);
                return;
            }

            c.set({
                x: d.x,
                y: d.y,
                orient: d.o,
                moving: d.m
            });
        },

        onPlayerDying: function(d) {
            var c = this.peers[d.id];
            if (!c) {
                console.log("Update from unknown #"+ d.id);
                return;
            }
            console.log("Dying", d);
            if (d.id != this.id)
                c.die();

            if (d.id == d.flameOwner)
                suicide(c.get('name'));
            else {
                var killer = this.peers[d.flameOwner];
                if (killer)
                    kill(c.get('name'), killer.get('name'));

                if (d.flameOwner == this.id)
                    play("win/" + Math.floor(Math.random()*10));
            }
        },

        playerChange: function(player) {
            this.sendPlayerChange(player);
        },

        playerDie: function(flame) {
            var flameOwner = -1;
            if (flame) {
                flameOwner = flame.get('owner');
                var oc = this.peers[ flameOwner ];
                console.log("Killed by: ", oc.get('name'));
            }

            this.socket.emit('dead', {
                id: this.id,
                flameOwner: flameOwner
            });
        },

        requestPlaceBomb: function(b) {
            this.socket.emit('put-bomb', {x: b.get('x'), y: b.get('y')});
            this.world.placeBombs.remove(b);
        },

        sendPlayerChange: _.throttle(function(player) {
            this.socket.emit('update', {
                id: this.id,
                x: Math.round( player.get('x') * 1000 ) / 1000,
                y: Math.round( player.get('y') * 1000 ) / 1000,
                o: player.get('orient'),
                m: player.get('moving')
            });
        }, 25),

        onChat: function(d) {
            d.chat = _.escape(d.chat);
            var c = this.peers[d.id];
            var cls = "chat";
            if (d.id == this.id) cls = "mychat";
            if (!c)
                chat('#' + d.id + '> ' + d.chat, cls);
            else
                chat(c.get('name') + '> ' + d.chat, cls);

            play('chat');
        },

        sendChat: function(chat) {
            chat = chat.trim();
            if (chat.length==0) return;
            this.socket.emit('chat', {
                id: this.id,
                chat: chat
            });
        },

        onBombPlaced: function(d) {
            this.world.bombs.add(new Bomb({x:d.x, y:d.y, owner:d.owner}));
        },

        onBombBoomed: function(d) {
            var b = this.world.bombs.find(function(b) {
                return b.get('x') == d.x && b.get('y') == d.y
            });

            // locate bomb
            this.world.explodeBomb(b, d.strength);
        },

        onTilesBroke: function(ds) {
            _.each(ds, _.bind(function(d) {
                this.world.map.setTile(d.x, d.y, TILE_EMPTY);
                this.world.map.setDirty(d.x, d.y);
                this.world.breakings.add( new BreakingTile({x:d.x, y:d.y}) );
            }, this));
        },

        onPing: function(d) {
            _.each(d.lags, _.bind(function(lag, id) {
                var p = this.peers[id];
                if (p) p.set('lag', lag);
            }, this));

            this.socket.emit('pong', {t: d.now} );
            this.world.updateScoring(false);
        },

        onScoreUpdates: function(d) {
            _.each(d, _.bind(function(score, id) {
                var p = this.peers[id];
                if (p) p.set('score', score);
            }, this));

            this.world.updateScoring(true);
        },


        onFriendScoreUpdates: function(d) {
            var self = this;
            var mates =_.map(d.ids, function(id) { return self.peers[id] });

            this.world.updateFriendScoring(mates, d.scores);
        }

    });



});