

define([
    "jquery", "underscore", "backbone",

    "text!../html/lobby.html",
//    "facebook",

    "Game"
], function($, _, Backbone, tpl) {


    LobbyView = Backbone.View.extend({

        initialize: function() {
            this.$el.html(_.template(tpl));

            this.initUsername();

            this.lobby = io.connect('/lobby');

            this.lobby.on('connect', _.bind(this.lobbyConnect, this));
            this.lobby.on('disconnect', _.bind(this.lobbyDisconnect, this));

            this.lobby.on('list-games', _.bind(this.onGamesList, this));

//            fb.on("auth", _.bind(this.gotFacebookUser, this));
//            fb.on("not-logged", function() {
//                $("#facebook-login").show();
//            });

            var frame = 0;
            setInterval(function() {
                frame = (frame+1)%4;
                $("ul.character").attr("class", "character frame"+frame);
            }, 250);

        },

        events: {
            "click .character li": "selectCharacter",
            "click .game-mode": "startGame"
        },

        selectCharacter: function(e) {
            $(".character li.selected").removeClass("selected");
            $(e.currentTarget).addClass("selected");
        },

        gotFacebookUser: function() {
            $("#facebook-login").fadeOut(500);

            $("#userpic").append($("<img/>").attr("src", window.location.protocol + "//graph.facebook.com/" + fb.uid + "/picture?type=square").fadeIn());
            $('#userid').val(fb.uname);
        },

        lobbyConnect: function(s) {
            console.log("lobby on!");
            this.listGames();
            this.timer = setInterval(_.bind(this.listGames, this), 2000);
        },

        lobbyDisconnect: function() {
            clearInterval(this.timer);
        },

        listGames: function() {
            this.lobby.emit("list-games");
        },

        onGamesList: function(games) {
            var gamesList = $('#games-list').empty();

            _.each(games, function(game, key) {
                var i = $(gameTemplate(game));
                i.data("game", key);
                gamesList.append(i);
            });
        },

        initUsername: function() {
            var $userid = $('#userid');

            var defaultUser = localStorage.getItem("userName");
            var chr = localStorage.getItem("character");

            if (defaultUser)
                $userid.val(defaultUser);

            if (!chr) {
                var chrs = $(".character-select li");
                var chrix = Math.floor(Math.random() * chrs.length);
                chrs.eq(chrix).addClass("selected");
            } else {
                $(".character-select li ." + chr).parent().addClass("selected");
            }

        },

        startGame: function(e) {
            var name = $('#userid').val();
            var game = $(e.currentTarget).data("game");
            var character = $(".character-select li.selected div").attr("class");

            localStorage.setItem("userName", name);
            localStorage.setItem("character", character);

            console.log("Joining " + game);

            if (name.length==0) {
                alert("Please enter a name.");
                return;
            }

            $("#lobby").hide();
            $("#game").show();

            new Game({
                playerName: name,
                // fbuid: fb.uid,
                character: character,
                game: game
            });

            console.log({
                            playerName: name,
                            fbuid: FBuid,
                            character: character,
                            game: game
                        });
        }

    });

    var gameTemplate = _.template('<div class="game-mode <%= type %>">'+
                                    '<div class="counter"><%= count %></div>' +
                                    '<div class="play">play</div>' +
                                '</div>)');

    var FBuid = -1;

});