

(function() {


    Player = Backbone.Model.extend({

        defaults: {
            alive: false,
            spawnAt: 0
        },

        initialize: function(opt) {
            this.id = this.get('id');
        },

        setUpdate: function(d) {
            this.set('x', d.x);
            this.set('y', d.y);
            this.set('o', d.o);
            this.set('m', d.m);
        },

        getUpdate: function() {
            return {
                id: this.get('id'),
                x: this.get('x'),
                y: this.get('y'),
                o: this.get('o'),
                m: this.get('m')
            };
        },

        getInitialInfo: function() {
            return {
                id: this.get('id'),
                name: this.get('name'),
                character: this.get('character')
            }
        },

        die: function() {
            console.log(this.get('name') + " died");
            this.set('alive', false);
        }
    });


    PlayerController = Backbone.Model.extend({

        initialize: function(opt) {
            this.id = opt.id;
            this.me = opt.player;
            this.game = opt.game;
            this.endpoint = opt.endpoint;
            this.socket = opt.socket;

            this.socket.on('update', _.bind(this.onUpdate, this));
            this.socket.on('dead', _.bind(this.onDead, this));
            this.socket.on('disconnect', _.bind(this.onDisconnect, this));
            this.socket.on('put-bomb', _.bind(this.onPlaceBomb, this));
            this.socket.on('chat', _.bind(this.onChat, this));

            // check for map changes
            this.game.map.on('notify', function() {
                this.socket.emit('map', this.game.map.getMap());
            }, this);
        },

        onUpdate: function(d) {
            this.me.setUpdate(d);
            // update everyone else about my update
            this.socket.broadcast.emit('player-update', this.me.getUpdate());
        },

        onDead: function(d) {
            this.me.die();
            this.me.set('spawnAt', this.game.lastTick + SPAWNING_TIME);
            // notify everyone else
            this.socket.broadcast.emit('player-dying', d);
        },

        onDisconnect: function() {
            console.log("- " + this.me.get('name') + " disconnected");
            this.socket.broadcast.emit('player-disconnected', {id: this.id} );

            this.trigger("disconnect");
        },

        onPlaceBomb: function(d) {
            console.log('Placing bomb at ' + d.x + ", " + d.y);

            if (!this.game.bombs.any(function(b) { return b.get('x') == d.x && b.get('y') == d.y; }))
            {
                // no bomb here
                this.game.bombs.add(new Bomb({x: d.x, y: d.y}));
                // notify everyone
                this.endpoint.emit('bomb-placed', {x: d.x, y: d.y});
            } else {
                console.log('A bomb at ' + d.x + ", " + d.y + " already exists!");
            }
        },

        onChat: function(d) {
            console.log('> ' + this.me.get('name') + ": " + d.chat, 'chat');
            this.endpoint.emit('chat', d);
        },

        spawnPlayer: function() {
            this.me.set('alive', true);
            var loc = this.game.map.getValidSpawnLocation();
            console.log("  . Spawn " + this.me.get('name') + " at " + loc.x+","+loc.y);
            this.endpoint.emit('player-spawned', {
                id: this.id,
                x: loc.x,
                y: loc.y
            });
        },

        notifyGameState: function(d) {
            // send map
            this.socket.emit('map', this.game.map.getMap());

            // joined players
            _.each(this.game.playersById, function(p) {
                if (p == this.me) return;
                this.socket.emit('player-joined', p.getInitialInfo());

                if (p.get('alive')) {
                    this.socket.emit('player-spawned', {id: p.get('id'), x: p.get('x'), y: p.get('y')});
                }
            }, this);

            // placed bombs
            // TODO
        }

    });


})();