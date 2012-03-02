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



    Bomb = Backbone.Model.extend({
        defaults: {
            x: 0,
            y: 0,
            timePlaced: 0,
            fuseTime: 2500,
            strength: 4
        }
    });


    BombCollection = Backbone.Collection.extend({
    });


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
            width: 27,
            height: 19,
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
            // check bounds
            if (x<0) return -1;
            if (x>=this.get('width')) return -1;
            if (y<0) return -1;
            if (y>=this.get('height')) return -1;

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

        setAbsMap: function(x, y, c, silent) {
            if (silent === undefined) silent = false;
            var ix = (y - this.get('y')) * this.get('width') + (x - this.get('x'));
            var map = this.get('map');
            this.set('map', map.substr(0, ix) + c + map.substr(ix+1), {silent: silent});
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


    Game = Backbone.Model.extend({

        defaults: {
            endPoint: 'game'
        },

        bombs: null,

        initialize: function() {

            this.map = new Map();
            this.bombs = new BombCollection();

            this.bombs.on('add', this.onBombAdded, this);
        },

        onBombAdded: function(b) {
            // set a timer.. TODO - is it ok to have lots of timers?
            setTimeout(_.bind(function() {
                this.explodeBomb(b);
            }, this), b.get('fuseTime'));
        },

        explodeBomb: function(b) {
            this.bombs.remove(b);

            var strength = b.get('strength');

            // update map
            var dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
            _.each(dirs, _.bind(function(dir) {
                for(var i=1; i<=strength; i++) {
                    var xx = b.get('x') + dir[0]*i;
                    var yy = b.get('y') + dir[1]*i;

                    var cb;
                    if (cb = this.getBomb(xx, yy)) {
                        console.log("Chained explosion!");
                        this.explodeBomb(cb);
                    }

                    if (this.map.getAbsTile( xx, yy ) == TILE_BRICK) {
                        this.map.setAbsMap( xx, yy, TILE_EMPTY );
                        return;
                    }
                }
            },this));
        },

        getBomb: function(x,y) {
            return this.bombs.find(function(b) { return b.get('x') == x && b.get('y') == y; });
        }
    });


    var maxPlayerId = 0;
    var players = {};

    Server = Backbone.Model.extend({

        initialize: function(opt) {

            var io = opt.io;

            io.set('log level', 1);

            this.game = new Game();

            this.game.bombs.on('remove', this.onBombRemoved, this);

            this.endpoint = io.of('/game');
            this.endpoint.on('connection', _.bind(this.connection, this));
        },

        connection: function(socket) {
            var playerId = ++maxPlayerId;
            var name = "?";

            var newPlayerInfo = this.game.map.prepareNewPlayer();

            var me = new Player();
            me.set('id', playerId);
            players[playerId] = me;

            // check for map changes
            this.game.map.on('change', _.debounce(function() {
                socket.emit('map', this.game.map.getMap());
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
                socket.emit('map', this.game.map.getMap());
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

            socket.on('put-bomb', _.bind(function(d){
                console.log('trying to place bomb at ' + d.x + ", " + d.y);

                if (!this.game.bombs.any(function(b) { return b.get('x') == d.x && b.get('y') == d.y; })) {
                    // no bomb here
                    this.game.bombs.add(new Bomb({x: d.x, y: d.y}));
                    this.endpoint.emit('bomb-placed', {x: d.x, y: d.y});
                } else {
                    console.log('bomb at ' + d.x + ", " + d.y + " already exists!");
                }
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
        },

        onBombRemoved: function(b) {
            console.log('exploding bomb at ' + b.get('x') + "," + b.get('y'));

            this.endpoint.emit('bomb-boomed', {
                x: b.get('x'),
                y: b.get('y'),
                strength: b.get('strength')
            });
        }


    });

})();