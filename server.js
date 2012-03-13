

var public = "web/";

// IMPORTS ______________________________________________________

var express = require("express"),
    crypto = require("crypto"),
    fs = require("fs");

var http = express.createServer();
var https = express.createServer({
    key: fs.readFileSync("privatekey.pem"),
    cert: fs.readFileSync("certificate.pem")
});

//_______________________________________________________________
// IO

var io = require('socket.io').listen(http);

//io.set('transports', [
//    'websocket',
//    'flashsocket',
//    'htmlfile',
//    'xhr-polling',
//    'jsonp-polling'
//]);

//_______________________________________________________________
// Server

var server = require("./server/server");

var s = new Server({io: io});


var register = function (app) {


    app.use("/", express.static(public));

    app.use(express.bodyParser());

    app.post('/fb/', function(req, res) {

        var fb_app_id = "209351425839638";
        var fb_canvas_url = "https://playshortfuse.com/fb/";
        var fb_secret = 'f96d4be66d931678b7c5f12ee02e8db4';

        // ---

        var signed_request = req.param('signed_request');

        if (!signed_request) {
            res.send("Request not signed.");
            res.end();
        }

        var parts = signed_request.split('.');
        var sig = base64UrlToBase64(parts[0]);
        var payload = parts[1];
        var data = JSON.parse(base64UrlToString(payload));

        if (!data.user_id) {
            // authorize
            var auth_url = "http://www.facebook.com/dialog/oauth?client_id=" + fb_app_id + "&redirect_uri=" + urlencode(fb_canvas_url);
            res.send("<script> top.location.href='" +auth_url + "'; </script>");
        }
        else {
            // lets verify
            if (data.algorithm.toUpperCase() !== 'HMAC-SHA256') {
                // TODO
                res.send('Unknown algorithm. Expected HMAC-SHA256');
                return;
            }
            var hmac = require('crypto').createHmac('sha256', fb_secret);
            hmac.update(payload);
            var expected_sig = hmac.digest('base64');
            if (sig != expected_sig){
                // TODO
                console.log('expected [' + expected_sig + '] got [' + sig + ']');
                res.send('Hello, this is my app! you are CHEATING! .. expected [' + expected_sig + '] got [' + sig + ']');
            }
            else {
                // TODO
                res.send('Hello, this is my app! you passed verification and are ' + data.user_id);
            }
        }
        res.end();
    });

};

//_______________________________________________________________
// Facebook

var base64ToString = function(str) {
    return (new Buffer(str || "", "base64")).toString("ascii");
};

var base64UrlToString = function(str) {
    return base64ToString( base64UrlToBase64(str) );
};

var base64UrlToBase64 = function(str) {
    var paddingNeeded = (4- (str.length%4));
    for (var i = 0; i < paddingNeeded; i++) {
        str = str + '=';
    }
    return str.replace(/\-/g, '+').replace(/_/g, '/')
};

//_______________________________________________________________


register(http);
http.listen(8000);

register(https);
https.listen(8443);

console.log("Server started.");


