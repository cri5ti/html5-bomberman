

define([
    "jquery", "underscore", "backbone",

    "text!../html/lobby.html"
], function($, _, Backbone, tpl) {


    LobbyView = Backbone.View.extend({

        initialize: function() {

            this.$el.html(_.template(tpl));

            var frame = 0;
            setInterval(function() {
                frame = (frame+1)%4;
                $("ul.character").attr("class", "character frame"+frame);
            }, 250);

        },

        events: {
            "click .character li": "selectCharacter"
        },

        selectCharacter: function(e) {
            $(e.target).addClass("selected");
        }

    })

    /*
    init:

    $userid = $('#userid');

            $('#loginBtn').click(login);

            updateButton = function() {
                if ($userid.val().length==0)
                    $('#loginBtn').attr('disabled', 'disabled');
                else
                    $('#loginBtn').removeAttr('disabled');
            }

            $userid.change(updateButton);
            $userid.keyup(updateButton);

            $userid.keydown(function(e) {
                if (e.keyCode == 13) {
                    login();
                    e.stopImmediatePropagation();
                }
            });

            var defaultUser = localStorage.getItem("user");
            if (defaultUser)
                $userid.val(defaultUser);
            $userid.focus();

            updateButton();




    function login() {
        var userid = $userid.val();
        if (userid.length==0) return;

        localStorage.setItem("user", userid);

        $userid.blur();
        $("#welcome").hide();

        $("#ingame").show();

        start(userid);
    }

    function start(name) {
        var game = new Game({playerName: name});
    }

     */


});