
define([
    "jquery", "underscore", "backbone"
], function($, _, Backbone) {


    window.fbAsyncInit = function() {
        FB.init({
            appId      : '209351425839638', // App ID
            channelUrl : '//fb/static/channel.html', // Channel File
            status     : true, // check login status
            cookie     : true, // enable cookies to allow the server to access the session
            xfbml      : true  // parse XFBML
        });

        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                // the user is logged in and has authenticated your
                // app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed
                // request, and the time the access token
                // and signed request each expire
                var uid = response.authResponse.userID;
                var accessToken = response.authResponse.accessToken;

                $("#userpic").append($("<img/>").attr("src", "http://graph.facebook.com/" +uid+ "/picture?type=square").fadeIn());

                FB.api('/me', function(response) {
                    $('#userid').val(response.name);
                    console.log('Good to see you, ' + response.name + '.');
                });

                FB.api('/me/friends', { limit: 10 }, function(response) {
                    console.log('My friends: ', response);
                });

            } else if (response.status === 'not_authorized') {
                // the user is logged in to Facebook,
                // but has not authenticated your app
                alert('not authorized');
            } else {
                // the user isn't logged in to Facebook.
                alert('not logged in');
            }
        });

    };

    // Load the SDK Asynchronously
    (function(d){
        var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        ref.parentNode.insertBefore(js, ref);
    }(document));

});
