/**
 * Created by JetBrains WebStorm.
 * User: cristi
 * Date: 01/03/2012
 * Time: 12:46
 * To change this template use File | Settings | File Templates.
 */


define([
    "jquery", "underscore", "backbone",
],function($, _, Backbone, core) {



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
            c.set('moving', d.m);
            c.set('chat', d.chat);
        },

        playerChange: function(player) {
            this.socket.emit('update', {
                id: this.id,
                x: Math.round( player.get('x') * 1000 ) / 1000,
                y: Math.round( player.get('y') * 1000 ) / 1000,
                o: player.get('orient'),
                m: player.get('moving'),
                chat: player.get('chat')
            });
        }

    });



});