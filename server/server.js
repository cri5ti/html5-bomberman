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

    const TILE_EMPTY = 0;
    const TILE_BRICK = 1;
    const TILE_SOLID = 2;

    Map = Backbone.Model.extend({
        defaults: {
            width: 25,
            height: 20,
            x: 5,
            y: 3
        },

        initialize: function() {
            this.generateMap(this.get('width'), this.get('height'));
        },

        generateMap: function(w,h) {
            var map = new Array(w*h);
            for(var i=0; i<w*h; i++)
                map[i] = 0;

            var set = function(x,y,c) {
                map[y*w+x] = c;
            };

            // borders
            for(var i=0; i<w; i++) {
                for(var j=0; j<h; j++) {

                    if (i==0 || i==w-1 || j==0 || j==h-1)
                        set(i,j, TILE_SOLID);
                    else {
                        if (i%2==0 && j%2==0)
                            set(i,j, TILE_SOLID);
                        else if ( Math.floor(Math.random()*2)==0)
                            set(i,j, TILE_EMPTY);
                        else
                            set(i,j, TILE_BRICK);
                    }

                }
            }

            this.set({
                width: w,
                height: h,
                map: map.join("")
            });
        },

        getAbsTile: function(x, y) {
            return this.getTile(x - this.get('x'), y - this.get('y'));
        },

        getTile: function(x, y) {
            var c = this.get('map')[ y * this.get('width') + x ];
            return c*1;
        },

        getMap: function() {
            return {
                x: this.get('x'),
                y: this.get('y'),
                w: this.get('width'),
                h: this.get('height'),
                map: this.get('map')
            }
        },

        setAbsMap: function(x, y, c) {
            var ix = (y - this.get('y')) * this.get('width') + (x - this.get('x'));

            var map = this.get('map');
            this.set('map', map.substr(0, ix) + c + map.substr(ix+1));
        },

        prepareNewPlayer: function() {
            var valid = false;
            do {
                var x = Math.floor(Math.random()*this.get('width') + this.get('x'));
                var y = Math.floor(Math.random()*this.get('height') + this.get('y'));

                if (this.getAbsTile(x,y) != TILE_SOLID) {
                    valid = true;
                    // clear room
                    if (this.getAbsTile(x, y) == TILE_BRICK)  this.setAbsMap(x, y, TILE_EMPTY);
                    if (this.getAbsTile(x-1, y) == TILE_BRICK)  this.setAbsMap(x-1, y, TILE_EMPTY);
                    if (this.getAbsTile(x+1, y) == TILE_BRICK)  this.setAbsMap(x+1, y, TILE_EMPTY);
                    if (this.getAbsTile(x, y-1) == TILE_BRICK)  this.setAbsMap(x, y-1, TILE_EMPTY);
                    if (this.getAbsTile(x, y+1) == TILE_BRICK)  this.setAbsMap(x, y+1, TILE_EMPTY);
                }
            } while(!valid);

            return {
                x: x + .5,
                y: y + .5
            };
        }

    });

    var maxPlayerId = 0;
    var players = {};

    Server = Backbone.Model.extend({

        initialize: function(opt) {

            var io = opt.io;

            io.set('log level', 1);

            this.map = new Map();
//
//            setInterval(function() {
//
//            }, 2000);

            this.game = opt.io
                .of('/game')
                .on('connection', _.bind(this.connection, this));

        },

        connection: function(socket) {
            var playerId = ++maxPlayerId;
            var name = "?";

            var newPlayerInfo = this.map.prepareNewPlayer();

            var me = new Player();
            me.set('id', playerId);
            players[playerId] = me;

            // check for map changes
            this.map.on('change', _.debounce(function() {
                socket.emit('map', this.map.getMap());
            }, 50), this);

            socket.on('join', _.bind(function(d) {
                name = d.name;

                me.set('name', d.name);
                me.set('character', d.character);

                console.log("Player " + name + " joined ("+newPlayerInfo.x+","+newPlayerInfo.y+")");

                // notify everyone about me
                socket.broadcast.emit('player-joined', me.getInitialInfo());

                // update me about everything
                _.each(players, function(p) {
                    if (p == me) return;
                    socket.emit('player-joined', p.getInitialInfo());
                });

                // send map
                socket.emit('map', this.map.getMap());
            }, this));

            socket.on('update', _.bind(function(d) {
                // console.log(name + " at " + d.x+"," + d.y);
                me.setUpdate(d);
                socket.broadcast.emit('player-update', me.getUpdate());
            }, this));

            socket.on('disconnect', _.bind(function() {
                console.log(name + " disconnected");
                socket.broadcast.emit('player-disconnected', {id: playerId} );
                delete players[playerId];
            }, this));

            me.setUpdate({
                x: newPlayerInfo.x,
                y: newPlayerInfo.y
            });

            // send info
            socket.emit('game-join', {
                game:"demo1",
                ver: 1,
                your_id: playerId,
                x: newPlayerInfo.x,
                y: newPlayerInfo.y
            });
        }


    });

})();