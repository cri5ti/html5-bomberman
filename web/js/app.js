
require.config(
    {
        baseUrl: "js",
        paths: {
            "backbone": "lib/backbone",
            "underscore": "lib/underscore",
        },
        locale: "en"
    }
);


require([
    "jquery", "underscore", "backbone",
    "char"
],function($, _, Backbone, core) {


    var characters = ["john", "mary", "joe", "betty"];

    var LEFT = 37;
    var UP = 38;
    var RIGHT = 39;
    var DOWN = 40;

    PlayerCollection = Backbone.Collection.extend({

    });



    Networking = Backbone.Model.extend({

        initialize: function(opt) {
            this.id = -1;

            this.peers = {};

            this.world = opt.world;

            this.world.player.on('change', this.playerChange, this);

            this.socket = io.connect('http://192.168.0.2:1234/game');

            this.socket.on('disconnect', $.proxy(this.onDisconnect, this));

            this.socket.on('game-join', $.proxy(this.onGameJoin, this));
            this.socket.on('player-joined', $.proxy(this.onPlayerJoined, this));
            this.socket.on('player-update', $.proxy(this.onPlayerUpdated, this));
            this.socket.on('player-disconnected', $.proxy(this.onPlayerDisconnected, this));
        },

        onDisconnect: function() {
            $('#waitserver').show();

            _.each(this.peers, _.bind(function(p) {
                this.world.players.remove(p);
            }, this));
//            this.world.players.remove(c);
//            delete this.peers[d.id];
        },

        onGameJoin: function(d) {
            $('#waitserver').hide();

            this.id = d.your_id;
            console.log("Joined game " + d.game + " (my id = " + this.id + ")");

            // my position
            this.world.player.set('x', d.x);
            this.world.player.set('y', d.y);

            this.socket.emit('join', {
                id: this.id,
                name: this.world.player.get('name'),
                character: this.world.player.get('character')
            });
        },

        onPlayerJoined: function(d) {
            console.log(d.name + " joined");
            var c = new Character({
                name: d.name,
                character: d.character,
                x: d.x,
                y: d.y
            });

            this.world.players.add(c);
            this.peers[d.id] = c;
        },

        onPlayerDisconnected: function(d) {
            var c = this.peers[d.id];
            console.log(c.get('name') + " disconnected");

            this.world.players.remove(c);
            delete this.peers[d.id];
        },

        onPlayerUpdated: function(d) {
            var c = this.peers[d.id];
            if (!c) {
                console.log("Unknown client #"+ d.id);
                return;
            }
//            console.log(c.get('name') + " ("+d.id+") update");
            c.set('x', d.x);
            c.set('y', d.y);
            c.set('orient', d.o);
            c.set('chat', d.chat);
        },

        playerChange: function(player) {
            this.socket.emit('update', {
                id: this.id,
                x: player.get('x'),
                y: player.get('y'),
                o: player.get('orient'),
                chat: player.get('chat')
            });
        }

    });


    World = Backbone.Model.extend({
        $map: null,

        player: null,
        players: new PlayerCollection,
        playerViews: [],
        npcs: [],

        initialize: function(opt) {
            this.$map = opt.map;

            this.players.on('add', this.onCharacterAdded, this);
            this.players.on('remove', this.onCharacterRemoved, this);

            if (opt.player) {
                // create our player
                this.player = new Character({
                    name: "John" + Math.floor(Math.random()*100),
                    character: characters[Math.floor(Math.random()*(characters.length))]
                });
                this.players.add(this.player);
            }

            for(var i=0; i<opt.npcs; i++) {
                // create a npc
                this.players.add(new NpcCharacter({
                    x: Math.random()*300 + 50,
                    y: Math.random()*300 + 50,
                    character: characters[Math.floor(Math.random()*(characters.length-1))+1]
                }));
            }
        },


        onCharacterAdded: function(c) {
            // create a view for the character
            var cv = new CharacterView({model: c});
            this.playerViews.push(cv);
            this.$map.append(cv.el);
        },

        onCharacterRemoved: function(c) {
            var cv = _.find(this.playerViews, function(v) { return v.model == c });
            cv.$el.remove();
        },

        update: function() {
            this.players.each(function(p) {
                p.update();
            });
        }
    });





    /**
     * Initialize
     */
    $(function() {

        var $map = $("#map");

        var world = new World({
            map: $map,
            player: true,
            npcs: 0
        });

        var networking = new Networking({
            world: world
        });

        var me = world.player;

        var keymap = {};

        var $chatbox = $("#chatbox");
        $chatbox.keyup(_.throttle(function() {
            if ($chatbox.val().length>0)
                world.player.sendMessage($chatbox.val()+"...");
        },50));

        $(document).keydown(function(e){
            keymap[e.keyCode] = true;

            if (e.keyCode == 13) {
                if ($chatbox.is(":focus")) {
                    world.player.sendMessage($chatbox.val());
                    $chatbox.val("");
                } else
                    $chatbox.focus();
            }
        });

        $(document).keyup(function(e){
            keymap[e.keyCode] = false;
        });

        setInterval(function() {
            // handle input
            if (keymap[LEFT])   me.deltaMove(-1, 0);
            if (keymap[RIGHT])  me.deltaMove(1, 0);
            if (keymap[UP])     me.deltaMove(0, -1);
            if (keymap[DOWN])   me.deltaMove(0, 1);

            world.update();
        }, 50);

    });

});
