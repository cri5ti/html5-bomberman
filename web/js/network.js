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

            this.socket = io.connect('http://192.168.0.2:8000/game');

            this.socket.on('disconnect', $.proxy(this.onDisconnect, this));

            this.socket.on('game-join', $.proxy(this.onGameJoin, this));
            this.socket.on('map', $.proxy(this.onMapUpdate, this));
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
            console.log(d.name + " #" + d.id + " joined");
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
            if (!c) return; // we don't know this guy
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
                moving: d.m,
                chat: d.chat
            });
        },

        playerChange: function(player) {
            _.debounce(this.sendPlayerChange)
            this.sendPlayerChange(player);
        },

        sendPlayerChange: function(player) {
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