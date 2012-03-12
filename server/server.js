

TILE_EMPTY = 0;
TILE_BRICK = 1;
TILE_SOLID = 2;


SPAWNING_TIME = 5000;


_ = require('underscore')._;
Backbone = require('backbone');

require('./map.js');
require('./game.js');
require('./model.js');
require("./player.js");

(function() {


    Server = Backbone.Model.extend({

        initialize: function(opt) {
            var io = opt.io;

            io.set('log level', 1);

            this.game = new Game();

            this.game.bombs.on('remove', this.onBombRemoved, this);

            this.game.on('score-changes', _.debounce(this.notifyScoreUpdates, 50), this);


            this.endpoint = io.of('/game');
            this.endpoint.on('connection', _.bind(this.connection, this));
        },

        connection: function(socket) {
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

                // create new player
                var me = new Player({
                    id: playerId,
                    name: d.name,
                    character: d.character
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
                }, this));

                console.log("+ " + name + " joined the game");

                // notify everyone about my join
                socket.broadcast.emit('player-joined', me.getInitialInfo());

                // update me about the current game state
                ctrl.notifyGameState();
            }, this));

        },

        onBombRemoved: function(b) {
            console.log('exploding bomb at ' + b.get('x') + "," + b.get('y'));

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

})();