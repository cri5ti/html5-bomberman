
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

            this.socket = io.connect('/game');

            this.socket.on('disconnect', $.proxy(this.onDisconnect, this));

            this.socket.on('game-info', $.proxy(this.onGameJoin, this));
            this.socket.on('map', $.proxy(this.onMapUpdate, this));
            this.socket.on('player-joined', $.proxy(this.onPlayerJoined, this));
            this.socket.on('player-spawned', $.proxy(this.onPlayerSpawned, this));
            this.socket.on('player-update', $.proxy(this.onPlayerUpdated, this));
            this.socket.on('player-dying', $.proxy(this.onPlayerDying, this));
            this.socket.on('player-disconnected', $.proxy(this.onPlayerDisconnected, this));
            this.socket.on('chat', $.proxy(this.onChat, this));

            this.socket.on('bomb-placed', $.proxy(this.onBombPlaced, this));
            this.socket.on('bomb-boomed', $.proxy(this.onBombBoomed, this));
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
                name: this.world.player.get('name'),
                character: this.world.player.get('character')
            });

            // mark ourself in the peer list
            this.peers[this.id] = this.world.player;
        },

        onMapUpdate: function(d) {
            this.world.map.set({
                x: d.x,
                y: d.y,
                width: d.w,
                height: d.h,
                map: d.map
            });
        },

        onPlayerJoined: function(d) {
            info("<u>" + d.name + "</u> joined");
            console.log(d.name + " #" + d.id + " joined");
            var c = new Character({
                name: d.name,
                character: d.character
            });
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
        },

        onPlayerDisconnected: function(d) {
            var c = this.peers[d.id];
            if (!c) return; // we don't know this guy
            info("<u>" + c.get('name') + "</u> disconnected");
            console.log(c.get('name') + " disconnected");

            this.world.players.remove(c);
            delete this.peers[d.id];
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
            c.die();
        },

        playerChange: function(player) {
            _.debounce(this.sendPlayerChange)
            this.sendPlayerChange(player);
        },

        playerDie: function(player) {
            this.socket.emit('dead', {
                id: this.id
            });
        },

        requestPlaceBomb: function(b) {
            this.socket.emit('put-bomb', {x: b.get('x'), y: b.get('y')});
            this.world.placeBombs.remove(b);
        },

        sendPlayerChange: function(player) {
            this.socket.emit('update', {
                id: this.id,
                x: Math.round( player.get('x') * 1000 ) / 1000,
                y: Math.round( player.get('y') * 1000 ) / 1000,
                o: player.get('orient'),
                m: player.get('moving')
            });
        },

        onChat: function(d) {
            var c = this.peers[d.id];
            var cls = "chat";
            if (d.id == this.id) cls = "mychat";
            if (!c)
                chat('#' + d.id + '> ' + d.chat, cls);
            else
                chat(c.get('name') + '> ' + d.chat, cls);
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
            this.world.bombs.add(new Bomb({x:d.x, y:d.y}));
        },

        onBombBoomed: function(d) {
            var b = this.world.bombs.find(function(b) {
                return b.get('x') == d.x && b.get('y') == d.y
            });

            // locate bomb
            this.world.explodeBomb(b, d.strength);
        }

    });



});