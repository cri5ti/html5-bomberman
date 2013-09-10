

TILE_EMPTY = 0;
TILE_BRICK = 1;
TILE_SOLID = 2;


SPAWNING_TIME = 5000;


_ = require('underscore')._;
Backbone = require('backbone');

var redis;

require('./map.js');
require('./game.js');
require('./model.js');
require("./player.js");


var Server = Backbone.Model.extend({

    initialize: function(opt) {
        var io = opt.io;
        redis = opt.redis;

        global.counters.players = 0;
        global.counters.mapfill = 0;

        if (redis) {
            redis.incr("counters.restarts");
            redis.set("stats.last-start-time", (new Date()).getTime());
        }

        io.set('log level', 1);

        this.game = new Game({ redis: redis });

        this.game.bombs.on('remove', this.onBombRemoved, this);

        this.game.on('score-changes', _.debounce(this.notifyScoreUpdates, 50), this);


        this.endpoint = io.of('/game1');
        this.endpoint.on('connection', _.bind(this.connection, this));

        this.game.endpoint = this.endpoint;

        this.lobby = io.of('/lobby');
        this.lobby.on('connection', _.bind(this.lobbyConnection, this));
    },

    lobbyConnection: function(socket) {

        socket.on('list-games', _.bind(function(d) {
            socket.emit("list-games", {
                "game1": {
                    type: "free",
                    count: global.counters.players
                }
            });
        }, this));

    },

    connection: function(socket) {
        global.counters.players++;

        // generate id
        var playerId = this.game.generatePlayerId();

        // send game info
        socket.emit('game-info', {
            game:"demo1",
            ver: 1,
            your_id: playerId
        });

        // wait for join
        socket.on('join', _.bind(function(d) {
            var name = d.name;

            if (redis)
                redis.incr("counters.joined-players");

            // create new player
            var me = new Player({
                id: playerId,
                name: d.name,
                character: d.character,
                fbuid: d.fbuid
            });
            this.game.playersById[playerId] = me;

            // setup a player controller
            var ctrl = new PlayerController({
                id: playerId,
                player: me,
                game: this.game, // TODO joined game
                socket: socket,
                endpoint: this.endpoint
            });
            this.game.ctrlsById[playerId] = ctrl;

            ctrl.on('disconnect', _.bind(function() {
                delete this.game.playersById[playerId];
                delete this.game.ctrlsById[playerId];


                // FIXME D.R.Y.
                _.each(this.game.ctrlsById, function(ctrl, id) {
                    if (id == playerId) return;
                    ctrl.notifyFriendBattles();
                });

                global.counters.players--;
            }, this));

            console.log("+ " + name + " joined the game " + d.fbuid);

            // notify everyone about my join
            socket.broadcast.emit('player-joined', me.getInitialInfo());

            // update me about the current game state
            ctrl.notifyGameState();

            _.each(this.game.ctrlsById, function(ctrl, id) {
                if (id == playerId) return;
                ctrl.notifyFriendBattles();
            });
        }, this));

    },

    onBombRemoved: function(b) {
//            console.log('exploding bomb at ' + b.get('x') + "," + b.get('y'));

        this.endpoint.emit('bomb-boomed', {
            x: b.get('x'),
            y: b.get('y'),
            strength: b.get('strength')
        });
    },

    notifyScoreUpdates: function() {
        var scoring = {};
        _.each(this.game.playersById, function(p,id) {
            scoring[id] = p.get('score');
        });

        this.endpoint.emit('score-updates', scoring);
    }


});



module.exports = Server;