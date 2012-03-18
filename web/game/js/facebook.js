
define([
    "jquery", "underscore", "backbone"
], function($, _, Backbone) {


    var fb = {};

    _.extend(fb, Backbone.Events);

    window.fb = fb;

    fb.checkLogin = function() {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                // the user is logged in and has authenticated your
                // app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed
                // request, and the time the access token
                // and signed request each expire
                var uid = response.authResponse.userID;
                var accessToken = response.authResponse.accessToken;

                fb.uid = uid;

                FB.api('/me', function(response) {
                    fb.uname = response.name;
                    fb.trigger('auth');
                });

            } else if (response.status === 'not_authorized') {
                // the user is logged in to Facebook,
                // but has not authenticated your app
                fb.trigger('not-auth');
            } else {
                // the user isn't logged in to Facebook.
                fb.trigger('not-logged');
            }
        });
    }

    window.fbAsyncInit = function() {
        FB.init({
            appId      : '209351425839638', // App ID
            channelUrl : '//fb/static/channel.html', // Channel File
            status     : true, // check login status
            cookie     : true, // enable cookies to allow the server to access the session
            xfbml      : true  // parse XFBML
        });

        fb.checkLogin();

    };


    // Load the SDK Asynchronously
    (function(d){
        var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);
    }(document));


    return fb;

});
