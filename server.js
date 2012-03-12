

var public = "web/";

// IMPORTS ______________________________________________________

var http = require("http");
var fs = require("fs");
var express = require("express");
var site = express.createServer();
var url = require("url");

//_______________________________________________________________
// IO

var io = require('socket.io').listen(site);

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


//_______________________________________________________________
// Static resources

site.use("/", express.static(public));

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

site.post('/fb', function(req, res) {
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
        // send over to authorize url
    }
    else {
        // lets verify
        if (data.algorithm.toUpperCase() !== 'HMAC-SHA256') {
            res.send('Unknown algorithm. Expected HMAC-SHA256');
            return;
        }
        var secret = 'f96d4be66d931678b7c5f12ee02e8db4';
        var hmac = require('crypto').createHmac('sha256', secret);
        hmac.update(payload);
        var expected_sig = hmac.digest('base64');
        if (sig != expected_sig){
            console.log('expected [' + expected_sig + '] got [' + sig + ']');
            res.send('Hello, this is my app! you are CHEATING! .. expected [' + expected_sig + '] got [' + sig + ']');
        }
        else {
            res.send('Hello, this is my app! you passed verification and are ' + data.user_id);
        }
    }
});


//_______________________________________________________________


var port = process.env.PORT || 8000;

site.listen(port);

console.log("Server listening on :" + port);

