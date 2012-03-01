/**
 * Created by JetBrains WebStorm.
 * User: cristi
 * Date: 29/02/2012
 * Time: 14:15
 * To change this template use File | Settings | File Templates.
 */


(function() {
    _ = require('underscore')._;
    Backbone = require('backbone');




    Player = Backbone.Model.extend({
        setUpdate: function(d) {
            this.set('x', d.x);
            this.set('y', d.y);
            this.set('o', d.o);
            this.set('m', d.m);
            this.set('chat', d.chat);
        },

        getUpdate: function() {
            return {
                id: this.get('id'),
                x: this.get('x'),
                y: this.get('y'),
                o: this.get('o'),
                m: this.get('m'),
                chat: this.get('chat')
            };
        },

        getInitialInfo: function() {
            return {
                id: this.get('id'),
                name: this.get('name'),
                character: this.get('character'),
                x: this.get('x'),
                y: this.get('y'),
                o: this.get('o')
            }
        }
    });

    var maxPlayerId = 0;
    var players = {};

    Server = Backbone.Model.extend({

        initialize: function(opt) {

            opt.io.on('connection', function(socket) {
                socket.on('hello', function(d) {
                    console.log("someone said hello");
                    socket.emit('world', {go: 'away', game:true});
                });

                socket.emit('welcome', {message: 'you there?'});
            });

            this.game = opt.io
                .of('/game')
                .on('connection', _.bind(this.connection, this));

        },

        connection: function(socket) {
            var playerId = ++maxPlayerId;
            var name = "?";
            var x = Math.round(Math.random()*5 + 10);
            var y = Math.round(Math.random()*5 + 10);

            var me = new Player();
            me.set('id', playerId);
            players[playerId] = me;

            socket.on('join', _.bind(function(d) {
                name = d.name;

                me.set('name', d.name);
                me.set('character', d.character);

                console.log("Player " + name + " joined ("+x+","+y+")");

                // notify everyone about me
                socket.broadcast.emit('player-joined', me.getInitialInfo());

                // update me about everything
                _.each(players, function(p) {
                    if (p == me) return;
                    socket.emit('player-joined', p.getInitialInfo());
                });

                // send map
                socket.emit('map', {
                    x: 10, y: 10, w: 5, h: 5,
                    map: "11111" +
                         "10001" +
                         "10001" +
                         "10001" +
                         "11111"
                });
            }, this));

            socket.on('update', _.bind(function(d) {
                console.log(name + " at " + d.x+"," + d.y);
                me.setUpdate(d);
                socket.broadcast.emit('player-update', me.getUpdate());
            }, this));

            socket.on('disconnect', _.bind(function() {
                console.log(name + " disconnected");
                socket.broadcast.emit('player-disconnected', {id: playerId} );
                delete players[playerId];
            }, this));

            socket.on('hello', function() {
                console.log("someone said hello");
                socket.emit('world', {go: 'away', game:true});
            });

            me.setUpdate({x: x, y: y});

            // send info
            socket.emit('game-join', {
                game:"demo1",
                ver: 1,
                your_id: playerId,
                x: x,
                y: y
            });
        }


    });

})();