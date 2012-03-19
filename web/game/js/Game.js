

define([
    "jquery", "underscore", "backbone",

    "text!../html/game.html",

    "local",
    "Networking",
    "World"
], function($, _, Backbone, tpl) {

    Game = Backbone.View.extend({

        initialize: function(opt) {
            $("#game").html(tpl);

            _.defer(_.bind(this.layout, this));

            $(window).resize(_.bind(this.layout, this));

            this.world = new World({ container: $("#view") });

            // create our player
            this.world.player = new Character({
                name: opt.playerName,
                fbuid: opt.fbuid,
                character: opt.character
            });
            this.world.players.add(this.world.player);

            // network
            this.networking = new Networking({
                world: this.world,
                game: opt.game
            });

            // local
            this.local = new LocalManager({
                document: $(document),
                world: this.world,
                network: this.networking
            });

            this.lastTime = getTicks();

            _.defer(_.bind(this.update, this));

            this.initFriendsList();
        },

        layout: function() {
            var view = $("#view");
            var p = $(document);

            view.css({
                left: 220 + (p.width() - 220 - view.width()) / 2 + 'px',
                top: '20px'
            });

            var $chat = $("#chat");
            $chat.css({
                height: (p.height() - view.height() - 50) + 'px'
            });

            $chat.prop('scrollTop', $chat.prop('scrollHeight') );
        },

        update: function() {
            var now = getTicks();
            var delta = (now - this.lastTime) / 1000;

            this.local.update(delta);
            this.world.update(delta);

            this.lastTime = now;

            window.requestAnimationFrame(_.bind(this.update, this));
        },


        initFriendsList: function() {

            $("#friends-section .friend:not(.challenged)")
                .live("mouseenter", function() {
                    var item = $(this);

                    $(".who", item).fadeOut(100, function() {
                        $(".challenge", item).remove();
                        item.append($('<div class="challenge"><a href="#">Challenge friend</a></div>').fadeIn(200));
                    });
                })
                .live("mouseleave", function() {
                    var item = $(this);

                    $(".who", item).stop(false, true);
                    $(".challenge", item).stop(false, true);

                    $(".challenge", item).fadeOut(100, function() {
                        $(".challenge", item).remove();
                        $(".who", item).fadeIn(200);
                    });
                })
                .live('click', function() {
                    var item = $(this);
                    var user_id = item.data('id');

                    FB.ui( {
                        method: 'apprequests',
                        title: 'Challenge friend',
                        message: 'You have been challenged to a game of Short Fuse! Do you think you can handle it?',
                        to: user_id
                    }, function(res) {
                        if (!res) return;
                        console.log(res);
                        $(".who", item).text("Challenged!");
                        item.addClass("challenged");
                    });
                });

            $("#multi-challenge").click(function() {
                var item = $(this);

                // FIXME DRY as above (except :to)
                FB.ui( {
                    method: 'apprequests',
                    title: 'Challenge friend',
                    message: 'You have been challenged to a game of Short Fuse! Do you think you can handle it?',
                });
            });

            _.defer(_.bind(this.refreshFriends, this));
            setInterval(_.bind(this.refreshFriends, this), 30000);
        },

        refreshFriends: function() {
            FB.api({
                    method: 'fql.query',
                    query: 'SELECT uid, name FROM user WHERE uid IN ( SELECT uid2 FROM friend WHERE uid1 = me() ) ORDER BY rand() limit 5'
                }, function(res) {
                    if (res.error_code) return;

                    $("#friends-section").show();

                    var fs = $("#friends-section #friends");

                    fs.fadeOut(500, function() {
                        fs.empty();
                        _.each(res, function(f) {
                            var fv = $(friendChallengeTemplate(f));
                            fv.data('id', f.uid);
                            fs.append(fv);
                        });
                        fs.fadeIn(500);
                    })
                }
            );

        }

    });

    var friendChallengeTemplate = _.template(
        '<div class="friend">' +
            '<img class="icon" src="' +window.location.protocol+ '//graph.facebook.com/<%= uid %>/picture?type=square"/>' +
            '<div class="who"><%= name %></div>'+
        '</div>'
    );

    function getTicks() {
        return new Date().getTime();
    }

});
